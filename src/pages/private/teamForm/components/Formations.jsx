import React, { useMemo, useState } from "react";
import handleDelete from "../util/handleDelete";
import handleNewCLub from "../util/handleNewCLub";
import { pretty } from "../../match/utils/pretty";
import trash from "../../../../../public/trash.png";
import Notiflix from "notiflix";

import { LINEUPS_UPSERT_BUCKET } from "../../../../context/LineUpProvider";

import { getLineupKey, originalLineup, isDirty } from "../hooks/useFormations";
import handleUpdateStarters from "../util/handleUpdateStarters";
import { useNavigate } from "react-router-dom";
import { fetchUserData } from "../../../../hooks/useUserData";
import { usePartido } from "../../../../context/PartidoReducer";
import useAuth from "../../../../hooks/useAuth";

const Formations = ({
  ordered = [],
  players = [],
  activeClub,
  teamName,
  uid,
  dispatch,
  setShowForm,
  setTeamName,
}) => {
  if (!Array.isArray(ordered) || ordered.length === 0) return null;

  // ✅ estados reales (acá estaba tu error: editMode no existía)
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [draftStarters, setDraftStarters] = useState([]);
  const [draftCaptain, setDraftCaptain] = useState(null);

  const { dispatch: matchDispatch } = usePartido();

  const recargarDatos = async () => {
    if (uid) {
      await fetchUserData(uid, matchDispatch);
    }
  };

  // ✅ helpers
  const orig = useMemo(
    () => originalLineup(editingId, ordered),
    [editingId, ordered],
  );

  const dirty = useMemo(
    () => isDirty(orig, draftStarters, draftCaptain),
    [orig, draftStarters, draftCaptain],
  );

  const canUpdate = Boolean(
    editMode && editingId && dirty && draftStarters.length === 11,
  );

  // ✅ acciones
  const stopEdit = () => {
    setEditingId(null);
    setDraftStarters([]);
    setDraftCaptain(null);
  };

  const onToggleEditMode = () => {
    setEditMode((v) => {
      const next = !v;
      if (!next) stopEdit();
      return next;
    });
  };

  const startEditLineup = (lineup) => {
    const key = getLineupKey(lineup);
    if (!key) return;

    const base = Array.isArray(lineup.starters) ? lineup.starters : [];

    setEditingId(key);
    setDraftStarters([...base]);
    setDraftCaptain(lineup.captain ?? base[0] ?? null);
  };

  const removeFromDraft = (player) => {
    setDraftStarters((prev) => prev.filter((p) => p !== player));
    setDraftCaptain((prev) => (prev === player ? null : prev));
  };

  const playerKey = (p) =>
    typeof p === "string"
      ? p
      : String(p?.id ?? p?.key ?? p?.codigo ?? p?.name ?? p?.nombre ?? "");

  const starterKey = (s) =>
    typeof s === "string"
      ? s
      : String(s?.id ?? s?.key ?? s?.codigo ?? s?.name ?? s?.nombre ?? "");

  const startersSet = new Set(draftStarters.map(starterKey));

  // Lista de opciones como strings (keys) para el select
  const availablePlayers = players
    .map(playerKey)
    .filter((k) => k && !startersSet.has(k))
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  return (
    <div>
      <div className="bg-white shadow-md rounded-xl p-6 space-y-2">
        {/* Header + lápiz */}
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold text-green-700 mb-2 underline">
            Formaciones
          </h1>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm transition
              ${
                editMode
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            aria-label={editMode ? "Salir de edición" : "Editar formaciones"}
            title={editMode ? "Salir de edición" : "Editar formaciones"}
            onClick={onToggleEditMode}
          >
            ✏️
          </button>
        </div>

        {ordered.map((lineup) => {
          const key = getLineupKey(lineup);
          const isEditingThis = editMode && key && key === editingId;

          const base = isEditingThis
            ? draftStarters
            : Array.isArray(lineup.starters)
              ? lineup.starters
              : [];

          const sorted = [...base].sort((a, b) =>
            a.localeCompare(b, "es", { sensitivity: "base" }),
          );
          const col1 = sorted.slice(0, 4);
          const col2 = sorted.slice(4, 8);
          const col3 = sorted.slice(8, 11);

          return (
            <div
              key={key}
              className={`space-y-2 rounded-lg ${
                isEditingThis ? "ring-2 ring-red-200 p-2" : ""
              }`}
            >
              {/* Click para seleccionar cuál editar (solo si editMode) */}
              <div
                role={editMode ? "button" : undefined}
                tabIndex={editMode ? 0 : undefined}
                className={`${editMode ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (!editMode) return;
                  startEditLineup(lineup);
                }}
                onKeyDown={(e) => {
                  if (!editMode) return;
                  if (e.key === "Enter" || e.key === " ")
                    startEditLineup(lineup);
                }}
              >
                <div className="grid md:grid-cols-3 gap-1 md:gap-2">
                  {[col1, col2, col3].map((col, i) => (
                    <ul
                      key={i}
                      className="bg-gray-50 rounded-lg p-1 shadow-inner space-y-1"
                    >
                      {col.map((player) => (
                        <li
                          key={player}
                          className={`px-2 py-1.5 rounded text-left leading-tight ${
                            player === lineup.captain
                              ? "bg-yellow-50 border-l-4 border-yellow-400 font-medium text-yellow-900"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{pretty(player)}</span>

                            {/* ✅ borrar SOLO si estoy editando esa formación */}
                            {isEditingThis && (
                              <button
                                type="button"
                                className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  Notiflix.Confirm.show(
                                    "Eliminar jugador",
                                    `¿Quitar a ${pretty(player)} de esta formación?`,
                                    "Sí, Eliminar",
                                    "Cancelar",
                                    function okCb() {
                                      removeFromDraft(player);
                                    },
                                    function cancelCb() {
                                      // no hacemos nada
                                    },
                                  );
                                }}
                              >
                                <img
                                  src={trash}
                                  alt=""
                                  className="h-5 w-5"
                                  draggable={false}
                                />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}

                      {/* acciones abajo en la última columna */}
                      {i === 2 && (
                        <li className="flex justify-center items-center gap-2 mt-2">
                          {isEditingThis && (
                            <button
                              type="button"
                              className={`px-3 py-2 rounded text-sm font-semibold ${
                                canUpdate
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                              }`}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!canUpdate) return;
                                const ok = await handleUpdateStarters({
                                  formationId: editingId,
                                  starters: draftStarters,
                                  captainName: draftCaptain,
                                  activeClub,
                                  teamName,
                                  players,
                                  uid,
                                  dispatch,
                                  setShowForm,
                                });

                                if (ok) setDraftStarters(draftStarters);
                              }}
                              disabled={!canUpdate}
                              title={
                                canUpdate
                                  ? "Actualizar"
                                  : "Tenés que tener 11 jugadores para guardar"
                              }
                            >
                              Actualizar
                            </button>
                          )}

                          <button
                            type="button"
                            aria-label="Eliminar formación"
                            className="w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-lg font-bold flex items-center justify-center shadow"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                lineup,
                                activeClub,
                                teamName,
                                uid,
                                dispatch,
                              );
                            }}
                          >
                            ✕
                          </button>
                        </li>
                      )}
                    </ul>
                  ))}
                </div>
              </div>

              {/* ✅ reposición obligatoria con SelectStarters si faltan jugadores */}
              {isEditingThis && draftStarters.length < 11 && (
                <div className="mt-3">
                  <select
                    value=""
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (!selected) return;

                      setDraftStarters((prev) => [...prev, selected]);
                    }}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Seleccionar jugador...</option>
                    {availablePlayers.map((p) => (
                      <option key={p} value={p}>
                        {pretty(p)}
                      </option>
                    ))}
                  </select>

                  <p className="text-sm text-gray-600 mt-2">
                    Te faltan {11 - draftStarters.length} jugador(es)
                  </p>
                </div>
              )}

              <hr />
            </div>
          );
        })}

        <button
          className="bg-blue-500 text-white rounded w-full p-2"
          onClick={() => handleNewCLub(setShowForm, dispatch, setTeamName)}
        >
          Nuevo Club para Dirigir
        </button>
      </div>
    </div>
  );
};

export default Formations;

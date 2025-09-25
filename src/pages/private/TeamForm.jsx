// cspell: ignore Notiflix lenght notiflix Andrada, "Rossi", "Izquierdoz", "Heredia", "Golts", "Vergini", "Magallan", "Peruzzi", "Jara", "Buffarini", "Fabra", "Olaza", "Mas", "S.Perez", "Perez", "Barrios", "Nandez", "Villa", "Pavon", "Cardona", "Reynoso", "Tevez", "Zarate", "Wanchope", Benedetto, volvé, debés, firestore
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import useForm from "../../hooks/useForm";

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";

import Notiflix from "notiflix";
import {
  LINEUP_RESET,
  LINEUP_SET_SELECTED,
  LINEUP_SET_CAPTAIN,
  LINEUP_ADD_STARTER,
  LINEUP_REMOVE_STARTER,
  PLAYERS_ADD,
  PLAYERS_REMOVE,
  LINEUP_SAVE_LOCAL,
  LINEUP_DELETE_LOCAL,
  CLUB_SET_ACTIVE,
  CLUB_RESET,
  SAVE_CLUB_NAME,
  CLUB_LOAD_FROM_ACTIVE,
  LINEUPS_UPSERT_BUCKET,
  useLineups,
} from "../../context/LineUpProvider";

import { normalizeName } from "../../utils/normalizeName";
import useAuth from "../../hooks/useAuth";
import { db } from "../../configuration/firebase";
import { pretty } from "./match/utils/pretty";

const TeamForm = () => {
  const { form, changed, setValue } = useForm();
  const { uid, isAuthenticated } = useAuth();
  const hydratingRef = useRef(false);

  const [teamName, setTeamName] = useState(form.teamName || "");

  const { state: lineupState, dispatch } = useLineups();

  const {
    captainName,
    activeClub,
    starters,
    selectMode,
    selectedOption,
    lineups,
    players,
  } = lineupState;

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!uid) return;
    if (hydratingRef.current) return; // evita loaders duplicados

    (async () => {
      hydratingRef.current = true;
      Notiflix.Loading.circle("Cargando datos del club..."); // ⬅️ loader

      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) {
          return;
        }

        const data = snap.data();
        const remoteLineups = data?.lineups || {};

        for (const [clubKey, clubBucket] of Object.entries(remoteLineups)) {
          const players = Array.isArray(clubBucket.players)
            ? clubBucket.players.map(normalizeName)
            : [];

          const formations = clubBucket.formations
            ? Object.entries(clubBucket.formations)
                .map(([id, f]) => {
                  const createdAt =
                    f?.createdAt && typeof f.createdAt?.toDate === "function"
                      ? f.createdAt.toDate().toISOString()
                      : String(f?.createdAt || new Date().toISOString());

                  return {
                    id,
                    createdAt,
                    captain: normalizeName(f?.captain || ""),
                    starters: Array.isArray(f?.starters)
                      ? f.starters.map(normalizeName)
                      : [],
                  };
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [];

          dispatch({
            type: LINEUPS_UPSERT_BUCKET,
            payload: {
              club: normalizeName(clubKey),
              bucket: {
                label: clubBucket.label ?? clubKey,
                players,
                formations,
              },
            },
          });
        }
      } catch (e) {
        console.error("Hydration error:", e);
        Notiflix.Notify.failure(
          "Problemas al cargar la información de la nube"
        );
      } finally {
        Notiflix.Loading.remove(); // ⬅️ siempre sacá el loader
        hydratingRef.current = false;
      }
    })();
  }, [uid, dispatch, db]);

  useEffect(() => {
    const keys = Object.keys(lineups || {});
    if (keys.length === 0) return; // no hay buckets aún
    if (activeClub) return; // ya hay club activo

    const clubKey = keys[0]; // elegí el primero (simple)
    const label = lineups[clubKey]?.label || clubKey;

    dispatch({ type: SAVE_CLUB_NAME, payload: { name: label } });
    dispatch({ type: CLUB_LOAD_FROM_ACTIVE });
  }, [lineups, activeClub, dispatch]);

  useEffect(() => {
    if (!activeClub) return;
    const label = lineups?.[activeClub]?.label || activeClub;
    setTeamName(label);
  }, [activeClub, lineups]);

  const handleAddPlayer = () => {
    const name = normalizeName(form.playerName) || "";
    if (name.length < 2) {
      Notiflix.Notify.failure("Nombre Corto");
      return;
    }
    if (players.some((j) => normalizeName(j) === name)) {
      Notiflix.Notify.failure("Jugador repetido");
      return;
    }

    dispatch({ type: PLAYERS_ADD, payload: { name } });
    setValue("playerName", "");
    Notiflix.Notify.success("Jugador agregado");
  };

  const newLineup = () => {
    if (!teamName) {
      Notiflix.Notify.failure("¿Que Equipo dirigís?");
      return;
    }
    setShowForm(true);
    dispatch({ type: LINEUP_RESET });
    Notiflix.Notify.info("Creando nueva formación");
  };

  const handleSelectedOption = () => {
    if (!selectedOption) {
      Notiflix.Notify.failure("Elegí un capitán");
      return;
    }

    const normalized = normalizeName(selectedOption);

    if (!players.includes(normalized)) {
      Notiflix.Notify.failure("Capitán inválido");
      return;
    }

    if (starters.length >= 11 && !starters.includes(normalized)) {
      Notiflix.Notify.warning("Equipo Titular Completo");
      return;
    }

    dispatch({
      type: LINEUP_SET_CAPTAIN,
      payload: { captain: normalized },
    });
    Notiflix.Notify.success(`Capitán: ${pretty(normalized)}`);
  };

  const handleAddStarter = () => {
    const select = normalizeName(selectedOption);
    if (!select) {
      Notiflix.Notify.failure("Elegí un jugador");
      return;
    }
    if (starters.length >= 11) {
      Notiflix.Notify.warning("Ya hay 11");
      return;
    }
    if (starters.includes(select)) {
      Notiflix.Notify.warning("Ya está en titulares");
      return;
    }
    dispatch({ type: LINEUP_ADD_STARTER, payload: { player: select } });

    Notiflix.Notify.success("Titular agregado");
  };

  const handleSaveStarters = async () => {
    // Validaciones de UI
    if (starters.length !== 11) {
      Notiflix.Notify.failure("Debés elegir exactamente 11 titulares.");
      return;
    }
    if (!captainName) {
      Notiflix.Notify.failure("Elegí un capitán.");
      return;
    }
    if (!starters.includes(captainName)) {
      Notiflix.Notify.failure("El capitán debe estar entre los 11 titulares.");
      return;
    }
    if (!activeClub && !teamName) {
      Notiflix.Notify.failure(
        "Guardá el nombre del equipo antes de guardar la formación."
      );
      return;
    }

    // Datos base
    const id =
      crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    const clubKey = normalizeName(activeClub || teamName);
    const createdAtISO = new Date().toISOString();
    const captain = captainName;
    const startersPayload = [...starters];

    // Guardas para I/O
    if (!uid) {
      Notiflix.Notify.failure("No hay sesión.");
      return;
    }
    if (!clubKey) {
      Notiflix.Notify.failure("Falta el nombre del equipo.");
      return;
    }

    // Reducer primero (estado local consistente)
    dispatch({
      type: LINEUP_SAVE_LOCAL,
      payload: {
        id,
        name: teamName,
        captain: captainName,
        starters: startersPayload,
        createdAt: new Date(), // el reducer lo normaliza a ISO
        players: [...players],
      },
    });

    // Persistencia en Firestore
    try {
      await updateDoc(doc(db, "users", uid), {
        [`lineups.${clubKey}.formations.${id}`]: {
          createdAt: createdAtISO,
          captain,
          starters: startersPayload,
        },
        [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
      });

      setShowForm(false);
      Notiflix.Notify.success("Equipo guardado");
    } catch (e) {
      console.error(e);
      Notiflix.Notify.failure("No se pudo guardar la formación en la nube");
    }
  };

  const bucket = lineups?.[activeClub];
  const ordered = bucket
    ? [...bucket.formations].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : [];

  const { remaining, chosen } = useMemo(() => {
    const remaining = players
      .filter((p) => !starters.includes(p))
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    const chosen = players
      .filter((p) => starters.includes(p))
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    return { remaining, chosen };
  }, [players, starters]);

  const handleDelete = (lineup) => {
    const clubKey = normalizeName(activeClub || teamName);
    if (!uid || !clubKey) return;
    Notiflix.Confirm.show(
      "Confirmar eliminación",
      "¿Seguro que querés eliminar esta formación?",
      "Sí, eliminar",
      "Cancelar",
      async () => {
        dispatch({ type: LINEUP_DELETE_LOCAL, payload: { id: lineup.id } });
        Notiflix.Notify.success("Formación eliminada");

        const clubKey = normalizeName(activeClub || teamName);
        if (!uid || !clubKey) return;
        try {
          await updateDoc(doc(db, "users", uid), {
            [`lineups.${clubKey}.formations.${lineup.id}`]: deleteField(),
            [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
          });
        } catch (e) {
          console.error(e);
          Notiflix.Notify.failure("No se pudo eliminar en la nube");
        }
      },
      () => {
        // ❌ si cancela → no hagas nada
      }
    );
  };

  useEffect(() => {
    // 1) precondiciones
    if (!uid) return;
    if (!activeClub) return;

    const clubKey = normalizeName(activeClub);
    if (!clubKey) return;

    // 2) si no hay bucket local todavía, no intentes persistir
    if (!lineups[clubKey]) return;

    // 3) debounce 400ms
    const t = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "users", uid), {
          [`lineups.${clubKey}.players`]: players,
          [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
        });
        Notiflix.Notify.success("Plantel sincronizado");
      } catch (e) {
        console.error(e);
        Notiflix.Notify.failure("No se pudo sincronizar el plantel");
      }
    }, 400);

    return () => clearTimeout(t);
  }, [uid, db, activeClub, lineups, players]);

  useEffect(() => {
    if (lineupState?.activeClub) {
      setTeamName(pretty(lineupState.activeClub));
    }
  }, [lineupState?.activeClub]);

  const handleNewCLub = () => {
    Notiflix.Confirm.show(
      "Nuevos Horizontes",
      "¿Te vas a un nuevo Club??",
      "Sí, ya firme contrato",
      "no, apreté sin querer",
      () => {
        // ✅ si confirma
        setShowForm(false);
        dispatch({ type: LINEUP_RESET });
        dispatch({ type: CLUB_RESET });
        setTeamName("");
      },
      () => {
        // ❌ si cancela → no hagas nada
      }
    );
  };

  useEffect(() => {
    if (!uid) {
      dispatch({ type: CLUB_RESET }); // limpia activeClub, players, etc.
      // opcionalmente también:
      dispatch({
        type: LINEUPS_UPSERT_BUCKET,
        payload: { club: "", bucket: {} },
      });
    }
  }, [uid, dispatch]);

  const hasFormCaptain =
    showForm && selectMode === "captain" && players.length > 0;
  const hasFormStarters = selectMode === "starters" && players.length > 0;
  const hasCaptainBadge = Boolean(captainName);
  const hasStartersList = selectMode === "starters" && starters.length > 0;

  // si nada aplica, no mostramos el contenedor
  const shouldRenderBox =
    hasFormCaptain || hasFormStarters || hasCaptainBadge || hasStartersList;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <div className="bg-white shadow-md rounded-xl p-6 space-y-2">
            <h1 className="text-2xl font-bold text-blue-700 mb-2 underline">
              Equipo del DT: {pretty(teamName)}
            </h1>
            <label htmlFor="teamName">Nombre del Equipo</label>
            <div className="flex flex-row gap-2">
              <input
                type="text"
                name="teamName"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full p-2 border rounded"
                onBlur={async () => {
                  dispatch({
                    type: SAVE_CLUB_NAME,
                    payload: { name: teamName },
                  });

                  const clubKey = normalizeName(teamName);
                  if (!uid || !clubKey) return;

                  try {
                    await setDoc(
                      doc(db, "users", uid),
                      {
                        activeClub: clubKey,
                        lineups: {
                          [clubKey]: {
                            updatedAt: serverTimestamp(),
                          },
                        },
                      },
                      { merge: true }
                    );
                    Notiflix.Notify.success("Club guardado en la nube");
                  } catch (e) {
                    Notiflix.Notify.failure(
                      "No se pudo guardar el club en la nube"
                    );
                    console.error(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={async () => {
                  const clubKey = normalizeName(teamName);
                  if (!clubKey) {
                    Notiflix.Notify.failure("¿Qué equipo dirigís?");
                    return;
                  }
                  if (!uid) {
                    Notiflix.Notify.failure("No hay sesión.");
                    return;
                  }
                  // si ya existe en el state local
                  if (lineups[clubKey]) {
                    Notiflix.Notify.success(
                      "Bienvenido nuevamente a este Club."
                    );
                  }

                  // 1) fijar club activo en reducer
                  dispatch({
                    type: SAVE_CLUB_NAME,
                    payload: { name: teamName },
                  });

                  // 2) crear bucket en Firestore
                  try {
                    await setDoc(
                      doc(db, "users", uid),
                      {
                        activeClub: clubKey,
                        lineups: {
                          [clubKey]: { updatedAt: serverTimestamp() },
                        },
                      },
                      { merge: true }
                    );
                    const snap = await getDoc(doc(db, "users", uid));
                    const data = snap.exists() ? snap.data() : null;
                    const remoteClub = data?.lineups?.[clubKey] || null;
                    const formations = remoteClub?.formations
                      ? Object.entries(remoteClub.formations)
                          .map(([id, f]) => ({ id, ...f }))
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          )
                      : [];
                    if (remoteClub) {
                      dispatch({
                        type: LINEUPS_UPSERT_BUCKET,
                        payload: {
                          club: clubKey,
                          bucket: {
                            label: remoteClub.label ?? teamName,
                            players: remoteClub.players ?? [],
                            formations, // la array ordenada que armamos arriba
                          },
                        },
                      });
                    }

                    Notiflix.Notify.success("Club guardado en la nube");
                  } catch (e) {
                    Notiflix.Notify.failure(
                      "No se pudo guardar el club en la nube"
                    );
                    console.error(e);
                    return; // salí si falla
                  }

                  // 3) cargar bucket del club activo al estado
                  dispatch({ type: CLUB_LOAD_FROM_ACTIVE });

                  // 4) feedback final
                  Notiflix.Notify.success(
                    "Añade o modifica jugadores a tu club"
                  );
                }}
                className="bg-blue-500 text-white rounded"
              >
                Guardar Equipo
              </button>
            </div>

            <div>
              <label htmlFor="playerName">Jugadores</label>
              <div className="flex flex-row gap-2">
                <input
                  type="text"
                  name="playerName"
                  id="playerName"
                  value={form.playerName || ""}
                  onChange={changed}
                  className="w-full p-2 border rounded"
                  placeholder="Añadir jugador"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPlayer();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="bg-blue-500 text-white  rounded"
                >
                  Añadir Jugador
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Jugadores añadidos</h2>
                <span className="text-sm text-gray-500">
                  Total: {players.length}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {[...players]
                  .sort((a, b) =>
                    a.localeCompare(b, "es", { sensitivity: "base" })
                  )
                  .map((player) => (
                    <div
                      key={player}
                      className="flex items-center justify-between rounded-md bg-gray-50 border border-gray-200 px-2 py-1.5 hover:bg-gray-100"
                    >
                      <span
                        className="truncate text-gray-800"
                        title={pretty(player)} // tooltip en desktop
                      >
                        {pretty(player)}
                      </span>

                      <div className="flex items-center space-x-1">
                        {/* Botón info solo en mobile */}
                        <button
                          type="button"
                          className="md:hidden text-gray-400 hover:text-gray-600 text-sm"
                          aria-label="Ver nombre completo"
                          onClick={() => Notiflix.Notify.info(pretty(player))}
                        >
                          ℹ️
                        </button>

                        <button
                          type="button"
                          aria-label={`Eliminar ${pretty(player)}`}
                          title="Eliminar"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            if (selectedOption === player) {
                              dispatch({
                                type: LINEUP_SET_SELECTED,
                                payload: "",
                              });
                            }
                            dispatch({
                              type: PLAYERS_REMOVE,
                              payload: { name: player },
                            });
                            Notiflix.Notify.success("Jugador eliminado");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              type="button"
              onClick={newLineup}
              className="bg-blue-500 text-white rounded w-full p-2"
            >
              Nueva Formación
            </button>
          </div>
        </div>

        {/* === CONTENEDOR PRINCIPAL CONTROLADO POR shouldRenderBox === */}
        {shouldRenderBox && (
          <div className="space-y-4 bg-white shadow-md rounded-xl p-6">
            {/* --- Paso 1: elegir Capitán --- */}
            {hasFormCaptain && (
              <div>
                <h1 className="text-xl font-semibold text-gray-800 mb-4">
                  Arma tu Formación Inicial
                </h1>

                <select
                  value={selectedOption}
                  onChange={(e) =>
                    dispatch({
                      type: LINEUP_SET_SELECTED,
                      payload: e.target.value,
                    })
                  }
                  className="border w-full"
                  disabled={players.length === 0}
                >
                  <option value="">Seleccionar Capitán</option>
                  {[...players]
                    .sort((a, b) =>
                      a.localeCompare(b, "es", { sensitivity: "base" })
                    )
                    .map((player) => (
                      <option key={player} value={player}>
                        {pretty(player)}
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={handleSelectedOption}
                  className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                  disabled={players.length === 0 || selectedOption === ""}
                >
                  Confirmar Capitán
                </button>
              </div>
            )}

            {/* --- Paso 2: agregar Titulares --- */}
            {hasFormStarters && (
              <div>
                <h1 className="text-xl font-semibold text-gray-800 mb-4 underline">
                  Arma tu Formación Inicial
                </h1>

                <select
                  value={selectedOption}
                  onChange={(e) =>
                    dispatch({
                      type: LINEUP_SET_SELECTED,
                      payload: e.target.value,
                    })
                  }
                  className="border w-full"
                  disabled={players.length === 0 || starters.length >= 11}
                >
                  <option value="">Elegí un titular</option>

                  {[...remaining].map((player) => (
                    <option key={player} value={player}>
                      {pretty(player)}
                    </option>
                  ))}

                  <option disabled value="">
                    — Ya elegidos —
                  </option>

                  {chosen.map((player) => (
                    <option key={player} value={player} disabled>
                      {pretty(player)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddStarter}
                  className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                  disabled={starters.length >= 11 || selectedOption === ""}
                >
                  Agregar Jugador Titular
                </button>
              </div>
            )}

            {/* --- Badge de Capitán (solo si hay capitán) --- */}
            {hasCaptainBadge && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                <strong>Capitán:</strong> {pretty(captainName)}
              </div>
            )}

            {/* --- Lista de Titulares + Guardar (solo si hay al menos 1) --- */}
            {hasStartersList && (
              <div>
                <h1>{`Titulares (${starters.length}/11)`}</h1>

                <ul className="list-disc pl-5 grid grid-cols-3 gap-x-6 gap-y-2 mb-2">
                  {[...starters]
                    .sort((a, b) =>
                      a.localeCompare(b, "es", { sensitivity: "base" })
                    )
                    .map((player) => (
                      <li
                        key={player}
                        className="text-gray-700 flex items-center"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            dispatch({
                              type: LINEUP_REMOVE_STARTER,
                              payload: { player },
                            });
                            Notiflix.Notify.success("Jugador eliminado");
                            if (player === captainName) {
                              Notiflix.Notify.info(
                                "Capitán eliminado. Volvé a elegir un capitán."
                              );
                            }
                          }}
                          className="mr-2"
                          aria-label={`Eliminar ${pretty(player)}`}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                        <span>{pretty(player)}</span>
                      </li>
                    ))}
                </ul>

                <button
                  className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                  onClick={handleSaveStarters}
                  disabled={starters.length !== 11 || !captainName}
                >
                  Guardar Titulares
                </button>
              </div>
            )}
          </div>
        )}

        {ordered.length > 0 && (
          <div className="bg-white shadow-md rounded-xl p-6 space-y-2">
            <h1 className="text-xl font-semibold text-green-700 mb-2 underline">
              Formaciones
            </h1>
            {ordered.map((lineup) => {
              const sorted = [...lineup.starters].sort((a, b) =>
                a.localeCompare(b, "es", { sensitivity: "base" })
              );
              const col1 = sorted.slice(0, 4);
              const col2 = sorted.slice(4, 8);
              const col3 = sorted.slice(8, 11);

              return (
                <div
                  key={lineup.id || lineup.createdAt.toString()}
                  className="space-y-2"
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
                            {pretty(player)}
                          </li>
                        ))}

                        {i === 2 && (
                          <li className="flex justify-center items-center">
                            <button
                              type="button"
                              aria-label="Eliminar formación"
                              className="w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-lg font-bold flex items-center justify-center shadow"
                              onClick={() => handleDelete(lineup)}
                            >
                              ✕
                            </button>
                          </li>
                        )}
                      </ul>
                    ))}
                  </div>

                  <hr />
                </div>
              );
            })}
            <button
              className="bg-blue-500 text-white rounded w-full p-2"
              onClick={handleNewCLub}
            >
              Nuevo Club para Dirigir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamForm;

/* 
 <div className="space-y-4 bg-white shadow-md rounded-xl p-6">
          {showForm && selectMode === "captain" && (
            <div>
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                Arma tu Formación Inicial
              </h1>
              <select
                value={selectedOption}
                onChange={(e) =>
                  dispatch({
                    type: LINEUP_SET_SELECTED,
                    payload: e.target.value,
                  })
                }
                className="border w-full"
                disabled={players.length === 0}
              >
                <option value="">Seleccionar Capitán</option>
                {[...players].sort().map((player) => (
                  <option key={player} value={player}>
                    {pretty(player)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSelectedOption}
                className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                disabled={players.length === 0 || selectedOption === ""}
              >
                Confirmar Capitán
              </button>
            </div>
          )}
          {selectMode === "starters" && (
            <div>
              <h1 className="text-xl font-semibold text-gray-800 mb-4 underline">
                Arma tu Formación Inicial
              </h1>
              <select
                value={selectedOption}
                onChange={(e) =>
                  dispatch({
                    type: LINEUP_SET_SELECTED,
                    payload: e.target.value,
                  })
                }
                className="border w-full"
                disabled={players.length === 0 || starters.length >= 11}
              >
                <option value="">Elegí un titular</option>
                {[...remaining].map((player) => (
                  <option key={player} value={player}>
                    {pretty(player)}
                  </option>
                ))}
                <option disabled value="">
                  — Ya elegidos —
                </option>
                {chosen.map((player) => (
                  <option key={player} value={player} disabled>
                    {pretty(player)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddStarter}
                className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                disabled={starters.length >= 11 || selectedOption === ""}
              >
                Agregar Jugador Titular
              </button>
            </div>
          )}
          {captainName && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <strong>Capitán:</strong> {pretty(captainName)}
            </div>
          )}
          {selectMode === "starters" && (
            <div>
              <h1>{`Titulares (${starters.length}/11)`}</h1>
              <ul className="list-disc pl-5 grid grid-cols-3 gap-x-6 gap-y-2 mb-2">
                {[...starters]
                  .sort((a, b) =>
                    a.localeCompare(b, "es", { sensitivity: "base" })
                  )
                  .map((player) => (
                    <li
                      key={player}
                      className="text-gray-700 flex items-center"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          // 1️⃣ Limpiamos derivadas antes que nada
                          dispatch({
                            type: LINEUP_REMOVE_STARTER,
                            payload: { player },
                          });

                          // 3️⃣ Mostramos la notificación al final
                          Notiflix.Notify.success("Jugador eliminado");

                          // 4️⃣ Si era capitán, notificamos
                          if (player === captainName) {
                            Notiflix.Notify.info(
                              "Capitán eliminado. Volvé a elegir un capitán."
                            );
                          }
                        }}
                      >
                        🗑️
                      </button>
                      <span>{pretty(player)}</span>
                    </li>
                  ))}
              </ul>
              <button
                className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                onClick={handleSaveStarters}
                disabled={starters.length !== 11 || !captainName}
              >
                Guardar Titulares
              </button>
            </div>
          )}
        </div>
*/

import React, { useEffect, useMemo, useState } from "react";
import { pretty } from "../utils/pretty";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";

const GoleadoresRivales = ({ state, dispatch, disabled }) => {
  /* ------ Rivales Sugeridos ------------ */
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();
  useUserData(uid, matchDispatch, lineupDispatch);
  const [data, setData] = useState(null);
  const clubs = Object.keys(lineupState?.lineups || []);
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || "",
  );
  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;
  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);
  const matches = Array.isArray(data?.matches) ? data.matches : [];

  /* ------ Rivales Sugeridos ------------ */

  const rival = state.rival?.trim() || "";
  const enabled = !!rival && !disabled;

  const suggestions = useMemo(() => {
    // 1) Sugerencias desde lo que YA cargaste en este formulario (no lo rompemos)
    const fromState = (state.goleadoresRivales || [])
      .map((g) => (g?.name || "").toString().trim())
      .filter(Boolean);

    // 2) Sugerencias desde historial: matches donde match.rival == rival actual
    const rivalKey = normalizeName(rival || "");

    const fromMatches = (matches || [])
      .filter((m) => normalizeName(m?.rival || "") === rivalKey)
      .flatMap((m) =>
        (m?.goleadoresRivales || [])
          .map((gr) => (gr?.name || "").toString().trim())
          .filter(Boolean),
      );

    // 3) Unificamos + ordenamos
    return Array.from(new Set([...fromMatches, ...fromState])).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" }),
    );
  }, [state.goleadoresRivales, matches, rival]);

  const [value, setValue] = useState("");

  const handleAdd = (name) => {
    const n = (name || "").trim();
    if (!n) return;
    const exists = (state.goleadoresRivales || []).some(
      (g) => g.name === n && g.club === rival,
    );
    if (exists) return;

    dispatch({
      type: "RIVAL_ADD",
      payload: {
        name: n,
        club: rival,
        gol: false,
        doblete: false,
        triplete: false,
        expulsion: false,
      },
    });
    setValue("");
  };

  const list = useMemo(
    () => (state.goleadoresRivales || []).filter((g) => g.club === rival),
    [state.goleadoresRivales, rival],
  );

  return (
    <div className="flex flex-col w-full">
      <div className="relative mt-2">
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
          Goleadores Rivales
        </label>
        <input
          type="text"
          name="rivalScorer"
          disabled={!enabled}
          placeholder={
            enabled
              ? "Apellido (usa Rival como club)"
              : "Completa Rival primero"
          }
          list="rival-players-list"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm 
                 transition-all cursor-pointer hover:border-sky-200
                 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (suggestions.includes(v)) return;
            setValue(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd(value);
            }
          }}
          onInput={(e) => {
            const v = e.currentTarget.value;
            if (suggestions.includes(v)) {
              handleAdd(v);
            }
          }}
        />
        <datalist id="rival-players-list">
          {suggestions.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>

        <ul className="flex flex-col gap-2 m-1">
          {[...list].reverse().map((s) => (
            <li
              key={`${s.name}-${s.club}`}
              className="border p-3 rounded-lg shadow-sm bg-white space-y-2"
            >
              {/* Fila superior */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700 flex-1">
                  {pretty(s.name)}
                </span>

                <label className="flex items-center gap-1 text-sm flex-1 justify-center">
                  <input
                    type="checkbox"
                    className="ml-4"
                    checked={s.gol}
                    onChange={() =>
                      dispatch({
                        type: "RIVAL_TOGGLE",
                        payload: { name: s.name, club: s.club, field: "gol" },
                      })
                    }
                  />
                  Gol
                </label>

                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 flex-1 text-right"
                  onClick={() =>
                    dispatch({
                      type: "RIVAL_REMOVE",
                      payload: { name: s.name, club: s.club },
                    })
                  }
                >
                  ❌
                </button>
              </div>

              {/* Fila inferior */}
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={s.doblete}
                    onChange={() =>
                      dispatch({
                        type: "RIVAL_TOGGLE",
                        payload: {
                          name: s.name,
                          club: s.club,
                          field: "doblete",
                        },
                      })
                    }
                  />
                  Doblete
                </label>

                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={s.triplete}
                    onChange={() =>
                      dispatch({
                        type: "RIVAL_TOGGLE",
                        payload: {
                          name: s.name,
                          club: s.club,
                          field: "triplete",
                        },
                      })
                    }
                  />
                  Triplete
                </label>

                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={s.expulsion}
                    onChange={() =>
                      dispatch({
                        type: "RIVAL_TOGGLE",
                        payload: {
                          name: s.name,
                          club: s.club,
                          field: "expulsion",
                        },
                      })
                    }
                  />
                  Expulsión
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GoleadoresRivales;

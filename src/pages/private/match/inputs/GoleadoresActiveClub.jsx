//cspell: ignore hattrick autogolesFavor
import React from "react";
import { pretty } from "../utils/pretty";

const GoleadoresActiveClub = ({ state, dispatch, disabled }) => {
  const starters = state.starters;
  const substitutes = state.substitutes;
  const plantel = [...starters, ...substitutes];

  const activeClub = state.activeClub;

  const handleSelect = (e) => {
    const selected = e.target.value;
    if (selected === "__OG__") {    
      dispatch({
        type: "ADD_GOLEADOR",
        payload: { name: "__OG__", activeClub, gol: true, isOwnGoal: true },
      });
      e.target.value = "";
      return;
    }
    const exists = state.goleadoresActiveClub.some(
      (g) => g.name === selected && g.activeClub === activeClub
    );
    if (exists) return;
    dispatch({ type: "ADD_GOLEADOR", payload: { name: selected, activeClub } });
  };

  const list = state.goleadoresActiveClub.filter(
    (g) => g.activeClub === activeClub
  );

  return (
    <div className="flex flex-col w-full">
      <div className="relative mt-2">
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
          Goleadores e Incidencias
        </label>
        <select
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm 
                 transition-all cursor-pointer hover:border-sky-200
                 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
          onChange={handleSelect}
          defaultValue=""
          name="incidents"
        >
          <option value="">Lista de Jugadores</option>
          <option value="__OG__">⚠️ Gol en contra (rival)</option>
          {plantel
            .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
            .map((player) => (
              <option key={player} value={player}>
                {pretty(player)}
              </option>
            ))}
        </select>
        <ul className="flex flex-col gap-2 my-2">
          {[...list].reverse().map((s) => {
            const isOG = s.isOwnGoal || s.name === "__OG__";
            const displayName = isOG ? "Gol en contra (rival)" : pretty(s.name);

            return (
              <li
                key={`${s.name}-${s.activeClub}`}
                className="border p-2 rounded-lg shadow-sm bg-white space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-700 flex-1">
                    {displayName}
                  </span>

                  <label className="flex items-center gap-1 text-sm flex-1 justify-center">
                    <input
                      type="checkbox"
                      className="ml-4"
                      checked={s.gol}
                      onChange={() =>
                        dispatch({
                          type: "TOGGLE_EVENT",
                          payload: { name: s.name, activeClub, event: "gol" },
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
                        type: "REMOVE_GOLEADOR",
                        payload: { name: s.name, activeClub },
                      })
                    }
                  >
                    ❌
                  </button>
                </div>

                <div className="flex gap-4 items-center">
                  {!isOG && (
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={s.doblete}
                        onChange={() =>
                          dispatch({
                            type: "TOGGLE_EVENT",
                            payload: {
                              name: s.name,
                              activeClub,
                              event: "doblete",
                            },
                          })
                        }
                      />
                      Doblete
                    </label>
                  )}

                  {!isOG && (
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={s.triplete}
                        onChange={() =>
                          dispatch({
                            type: "TOGGLE_EVENT",
                            payload: {
                              name: s.name,
                              activeClub,
                              event: "triplete",
                            },
                          })
                        }
                      />
                      Hat Trick
                    </label>
                  )}

                  {!isOG && (
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={s.expulsion}
                        onChange={() =>
                          dispatch({
                            type: "TOGGLE_EVENT",
                            payload: {
                              name: s.name,
                              activeClub,
                              event: "expulsion",
                            },
                          })
                        }
                      />
                      Expulsión
                    </label>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default GoleadoresActiveClub;

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
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">
        Goleadores e Incidencias
      </label>
      <select
        disabled={disabled}
        className="w-full border rounded p-2"
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
      <p className="text-xs text-gray-500">
        Elegí de la lista los goleadores o jugadores que sufrieron una expulsion
      </p>
      <ul className="flex flex-col gap-2 mt-2">
        {[...list].reverse().map((s) => {
          const isOG = s.isOwnGoal || s.name === "__OG__";
          const displayName = isOG ? "Gol en contra (rival)" : pretty(s.name);

          return (
            <li
              key={`${s.name}-${s.activeClub}`}
              className="border p-3 rounded-lg shadow-sm bg-white space-y-2"
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
  );
};

export default GoleadoresActiveClub;

//cspell: ignore hattrick
import React from "react";
import { pretty } from "../utils/pretty";

const GoleadoresActiveClub = ({ state, dispatch, disabled }) => {
  const starters = state.starters;
  const substitutes = state.substitutes;
  const plantel = [...starters, ...substitutes];

  const activeClub = state.activeClub;

  const handleSelect = (e) => {
    const selected = e.target.value;
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
        {[...list].reverse().map((s) => (
          <li
            key={`${s.name}-${s.activeClub}`}
            className="border p-3 rounded-lg shadow-sm bg-white space-y-2"
          >
            {/* Fila superior */}
            <div className="flex items-center justify-between">
              {/* Columna izquierda */}
              <span className="font-semibold text-blue-700 flex-1">
                {pretty(s.name)}
              </span>

              {/* Columna centro */}
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

              {/* Columna derecha */}
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

            {/* Fila inferior */}
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={s.doblete}
                  onChange={() =>
                    dispatch({
                      type: "TOGGLE_EVENT",
                      payload: { name: s.name, activeClub, event: "doblete" },
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
                      type: "TOGGLE_EVENT",
                      payload: { name: s.name, activeClub, event: "triplete" },
                    })
                  }
                />
                Hat Trick
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={s.expulsion}
                  onChange={() =>
                    dispatch({
                      type: "TOGGLE_EVENT",
                      payload: { name: s.name, activeClub, event: "expulsion" },
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
  );
};

export default GoleadoresActiveClub;

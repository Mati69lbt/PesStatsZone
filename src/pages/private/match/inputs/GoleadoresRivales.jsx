import React, { useMemo, useState } from "react";
import { pretty } from "../utils/pretty";

const GoleadoresRivales = ({ state, dispatch, disabled }) => {
  const rival = state.rival?.trim() || "";
  const enabled = !!rival && !disabled;

  const suggestions = useMemo(() => {
    const names = (state.goleadoresRivales || []).map((g) => g.name);
    return Array.from(new Set(names)).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );
  }, [state.goleadoresRivales]);

  const [value, setValue] = useState("");

  const handleAdd = (name) => {
    const n = (name || "").trim();
    if (!n) return;
    const exists = (state.goleadoresRivales || []).some(
      (g) => g.name === n && g.club === rival
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
    [state.goleadoresRivales, rival]
  );

  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">Goleadores Rivales</label>
      <input
        type="text"
        name="rivalScorer"
        disabled={!enabled}
        placeholder={
          enabled ? "Apellido (usa Rival como club)" : "Completa Rival primero"
        }
        list="rival-players-list"
        className="w-full border rounded p-2"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd(value);
        }}
        onInput={(e) => {
          // Si elige del datalist
          if (suggestions.includes(e.currentTarget.value)) {
            handleAdd(e.currentTarget.value);
          }
        }}
      />
      <datalist id="rival-players-list">
        {suggestions.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      <p className="text-xs text-gray-500">
        Escribí solo el <b>Apellido</b>. El club se toma del campo <b>Rival</b>.
      </p>

      <ul className="flex flex-col gap-2 mt-2">
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
  );
};

export default GoleadoresRivales;

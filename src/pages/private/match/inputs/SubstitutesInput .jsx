import React from "react";
import { pretty } from "../utils/pretty";

const SubstitutesInput = ({
  players = [],
  starters = [],
  value = [],
  onChange,
  disabled,
}) => {
  const playerList = players.filter((p) => !starters.includes(p));

  const handleSelect = (e) => {
    const selected = e.target.value;
    if (!selected) return; // no agregar vacío
    if (value.includes(selected)) return; // no duplicar
    onChange([...value, selected]); // agregar al array
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">Suplentes</label>
      <select
        disabled={disabled}
        className="w-full border rounded p-2"
        onChange={handleSelect}
        defaultValue=""
        name="substitutes"
      >
        <option value="">Lista de Suplentes</option>
        {playerList
          .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
          .map((player) => (
            <option key={player} value={player}>
              {pretty(player)}
            </option>
          ))}
      </select>
      <p className="text-xs text-gray-500">
        Elegí de la lista los jugadores que ingresaron
      </p>

      {/* listado horizontal de suplentes */}
      <ul className="flex flex-wrap gap-2 mt-2">
        {value.map((s) => (
          <li
            key={s}
            className="flex items-center bg-gray-100 px-3 py-1 rounded-lg"
          >
            {pretty(s)}
            <button
              type="button"
              className="text-red-500 hover:text-red-700 pl-1"
              onClick={() => onChange(value.filter((x) => x !== s))}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubstitutesInput;

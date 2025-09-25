import React from "react";
import { pretty } from "../utils/pretty";

const SubstitutesInput = ({
  players,
  starters,
  value,
  onChange,
  disabled,
  substitutes,
}) => {
  console.log(substitutes);
  console.log(substitutes.length);

  const playerList = players.filter((p) => !starters.includes(p));

  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">Suplentes</label>
      <select
        disabled={disabled}
        className="w-full border rounded p-2"
        value=""
        onChange={(e) => {
          const player = e.target.value;
          if (player && !value.includes(player) && value.length < 3) {
            onChange([...value, player]);
          }
        }}
      >
        <option value="">Elegí suplente</option>
        {playerList.map((p) => (
          <option key={p} value={p}>
            {pretty(p)}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Escribí y encontrá en la lista el apellido.
      </p>
      <ul className="flex flex-wrap gap-2 list-disc list-inside">
        {value.map((s) => (
          <li
            key={s}
            className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg"
          >
            {pretty(s)}{" "}
            <button
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

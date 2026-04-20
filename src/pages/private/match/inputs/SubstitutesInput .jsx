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
    <div className="flex flex-col w-full">
      <div className="relative mt-2">
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
          Suplentes
        </label>
        <select
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm 
                 transition-all cursor-pointer hover:border-sky-200
                 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
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
      </div>

      {/* listado horizontal de suplentes */}
      <ul className="flex flex-wrap gap-2 m-1">
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

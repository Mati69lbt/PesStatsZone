import React from "react";
import { pretty } from "../utils/pretty";

const CaptainSelect = ({ formations = [], value, onChange, disabled }) => {
  const list = Array.isArray(formations)
    ? formations
    : formations && typeof formations === "object"
    ? Object.values(formations)
    : [];

  const captains = Array.from(
    new Set(
      list
        .map((f) => f?.captain)
        .filter((c) => typeof c === "string" && c.trim() !== "")
    )
  );

  // const captains = formations.map((f) => f.captain);
  return (
    <div className="flex flex-col w-full">
      <div className="relative mt-2">
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
          Capitán
        </label>
        <select
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm 
                 transition-all cursor-pointer hover:border-sky-200
                 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- Elegí un Capitán --</option>
          {captains.map((opt) => (
            <option key={opt} value={opt}>
              {pretty ? pretty(opt) : opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CaptainSelect;

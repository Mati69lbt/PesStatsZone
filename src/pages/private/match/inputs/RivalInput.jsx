import React from "react";
import { pretty } from "../utils/pretty";

const RivalInput = ({ value, onChange, onBlur, suggestions = [] }) => {
  const cleanText = (s) => (s ?? "").toString().trim().replace(/\s+/g, " ");

  const uniqueSuggestions = Array.from(
    new Map(
      (suggestions || [])
        .map((s) => cleanText(s))
        .filter(Boolean)
        .map((s) => {
          const display = pretty(s);
          const key = display
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
          return [key, display];
        }),
    ).values(),
  ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  return (
    <div className="flex flex-col w-full">
      <div className="relative mt-2">
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
          Rival
        </label>
        <input
          type="text"
          name="rival"
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          list="sugerencias-rivales"
          placeholder="Rival (nombre completo)"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm 
                 transition-all cursor-pointer hover:border-sky-200
                 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
          autoComplete="off"
        />
        <datalist id="sugerencias-rivales">
          {(uniqueSuggestions || [])
            .slice()
            .sort((a, b) =>
              pretty(a).localeCompare(pretty(b), "es", { sensitivity: "base" }),
            )
            .map((opt) => (
              <option key={opt} value={pretty(opt)} />
            ))}
        </datalist>
      </div>
    </div>
  );
};

export default RivalInput;

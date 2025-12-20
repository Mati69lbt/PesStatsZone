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
        })
    ).values()
  ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">Rival</label>
      <input
        type="text"
        name="rival"
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        list="sugerencias-rivales"
        placeholder="Rival (nombre completo)"
        className="w-full border rounded p-2"
        autoComplete="off"
      />
      <datalist id="sugerencias-rivales">
        {(uniqueSuggestions || [])
          .slice()
          .sort((a, b) =>
            pretty(a).localeCompare(pretty(b), "es", { sensitivity: "base" })
          )
          .map((opt) => (
            <option key={opt} value={pretty(opt)} />
          ))}
      </datalist>
      <p className="text-xs text-gray-500">
        Elegí de la lista o escribí un rival nuevo.
      </p>
    </div>
  );
};

export default RivalInput;

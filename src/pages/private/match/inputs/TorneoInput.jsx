import React from "react";
import { pretty } from "../utils/pretty";

// TorneoInput.jsx
export default function TorneoInput({
  value,
  onChange,
  onBlur,
  suggestions = [],
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">Torneo</label>
      <input
        type="text"
        name="torneoName"
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        list="torneos-list"
        placeholder="Ej: Copa Argentina"
        className="w-full border rounded p-2"
        autoComplete="off"
      />
      <datalist id="torneos-list">
        {(suggestions || []).map((opt) => (
          <option key={opt} value={pretty(opt)} />
        ))}
      </datalist>
      <p className="text-xs text-gray-500">
        Elegí de la lista o escribí un torneo nuevo.
      </p>
    </div>
  );
}

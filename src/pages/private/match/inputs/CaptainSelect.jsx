import React from "react";
import { pretty } from "../utils/pretty";

const CaptainSelect = ({ formations = [], value, onChange }) => {
  const captains = formations.map((f) => f.captain);
  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">Capitán</label>
      <select
        className="w-full border rounded p-2"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Elegí un capitán --</option>
        {captains.map((opt) => (
          <option key={opt} value={opt}>
            {pretty ? pretty(opt) : opt}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">Elegí al Capitán de tu Equipo</p>
    </div>
  );
};

export default CaptainSelect;

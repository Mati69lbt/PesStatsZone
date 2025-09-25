import React from "react";
import { pretty } from "../utils/pretty";

const RivalInput = ({ value, onChange, onBlur, suggestions = [] }) => {
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
        {(suggestions || []).map((opt) => (
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

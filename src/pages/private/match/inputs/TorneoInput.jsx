import React, { useMemo } from "react";
import { pretty } from "../utils/pretty";

// TorneoInput.jsx
export default function TorneoInput({
  value,
  onChange,
  onBlur,
  suggestions = [],
  matches = [],
}) {

  const norm = (s) => (s ?? "").toString().trim().toLowerCase();

    const sortedSuggestions = useMemo(() => {
      const lastUsed = new Map();

      // matches puede venir como array o como objeto: lo normalizo a array
      const arr = Array.isArray(matches)
        ? matches
        : Array.isArray(matches?.matches)
        ? matches.matches
        : [];

      for (const m of arr) {
        const k = norm(m?.torneoName);
        if (!k) continue;
        const t = Number(m?.updatedAt) || 0;
        if (t > (lastUsed.get(k) || 0)) lastUsed.set(k, t);
      }

      const uniq = Array.from(new Set((suggestions || []).map(norm))).filter(
        Boolean
      );

      uniq.sort((a, b) => {
        const ta = lastUsed.get(a) || 0;
        const tb = lastUsed.get(b) || 0;

        if (tb !== ta) return tb - ta; // más nuevo primero
        return a.localeCompare(b); // fallback alfabético
      });

      return uniq;
    }, [suggestions, matches]);

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
        {(sortedSuggestions || []).map((opt) => (
          <option key={opt} value={pretty(opt)} />
        ))}
      </datalist>
      <p className="text-xs text-gray-500">
        Elegí de la lista o escribí un torneo nuevo.
      </p>
    </div>
  );
}

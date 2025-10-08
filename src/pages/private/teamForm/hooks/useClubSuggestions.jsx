// hooks/useClubSuggestions.jsx
import { useMemo } from "react";
import { pretty } from "../../match/utils/pretty";
import { normalizeName } from "../../../../utils/normalizeName";

export default function useClubSuggestions(managedClubs = [], lineups = {}) {
  return useMemo(() => {
    const map = new Map();

    // 1) managedClubs (claves normalizadas)
    for (const key of Array.isArray(managedClubs) ? managedClubs : []) {
      const k = normalizeName(key);
      if (!k) continue;
      map.set(k, pretty(k));
    }

    // 2) lineups (puede aportar un label “oficial”)
    for (const k of Object.keys(lineups || {})) {
      const key = normalizeName(k);
      if (!key) continue;
      const label = lineups[key]?.label || key;
      map.set(key, pretty(label));
    }

    // salida ordenada por label
    return [...map.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "es", { sensitivity: "base" })
      );
  }, [managedClubs, lineups]);
}

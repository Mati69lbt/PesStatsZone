import { useMemo } from "react";

export const useRivals = (matches) => {
  return useMemo(() => {
    const set = new Set();
    for (const m of matches || []) {
      const r = String(m?.rival ?? "").trim();
      if (r) set.add(r);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [matches]);
};

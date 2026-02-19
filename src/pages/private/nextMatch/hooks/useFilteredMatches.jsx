import { useMemo } from "react";

export const useFilteredMatches = (matches, selectedRival) => {
  return useMemo(() => {
    const list = Array.isArray(matches) ? matches : [];
    if (!selectedRival) return list;
    return list.filter((m) => String(m?.rival ?? "").trim() === selectedRival);
  }, [matches, selectedRival]);
};

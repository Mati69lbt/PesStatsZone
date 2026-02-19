import { useMemo } from "react";

export const useOrderedMatches = (filteredMatches) => {
  return useMemo(() => {
    const list = Array.isArray(filteredMatches) ? filteredMatches : [];
    return list
      .slice()
      .sort((a, b) => new Date(b?.fecha ?? 0) - new Date(a?.fecha ?? 0));
  }, [filteredMatches]);
};


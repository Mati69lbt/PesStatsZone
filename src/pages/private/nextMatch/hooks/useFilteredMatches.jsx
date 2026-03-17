import { useMemo } from "react";
import { normalizeName } from "../../../../utils/normalizeName";

export const useFilteredMatches = (matches, selectedRival) => {
  return useMemo(() => {
    const list = Array.isArray(matches) ? matches : [];

    if (!selectedRival) return list;

    return list.filter((m) => {
      const rivalPartido = normalizeName(m?.rival);
      const rivalSeleccionado = normalizeName(selectedRival);

      return rivalPartido === rivalSeleccionado;
    });
  }, [matches, selectedRival]);
};

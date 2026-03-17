import { useMemo } from "react";
import { normalizeName } from "../../../../utils/normalizeName";

export const useRivals = (matches) => {
  return useMemo(() => {
    const map = new Map();

    for (const m of matches || []) {
      const original = String(m?.rival ?? "").trim();

      if (original) {
        // La clave del Map es la versión normalizada (para no repetir)
        const id = normalizeName(original);

        // Solo guardamos el primer nombre original que encontremos para esa ID
        if (!map.has(id)) {
          map.set(id, original);
        }
      }
    }

    // Retornamos los nombres originales, que ya están unificados
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "es"));
  }, [matches]);
};

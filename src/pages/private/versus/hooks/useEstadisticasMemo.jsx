// cspell: ignore Estadisticas Ambito Direccion resumenes
import React, { useMemo } from "react";

const useEstadisticasMemo = (
  resumenes,
  ordenAmbito,
  ordenCampo,
  ordenDireccion
) => {
  return useMemo(() => {
    const entries = Object.entries(resumenes);
    const sorted = [...entries].sort((a, b) => {
      if (ordenCampo === "rival") {
        return ordenDireccion === "asc"
          ? a[0].localeCompare(b[0])
          : b[0].localeCompare(a[0]);
      }
      const valA = a[1]?.[ordenAmbito]?.[ordenCampo] ?? 0;
      const valB = b[1]?.[ordenAmbito]?.[ordenCampo] ?? 0;
      return ordenDireccion === "asc" ? valA - valB : valB - valA;
    });
    return sorted;
  }, [resumenes, ordenAmbito, ordenCampo, ordenDireccion]);
};

export default useEstadisticasMemo;

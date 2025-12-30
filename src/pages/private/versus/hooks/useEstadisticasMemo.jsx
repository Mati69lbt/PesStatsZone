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

    const boxA = a[1]?.[ordenAmbito] ?? {};
    const boxB = b[1]?.[ordenAmbito] ?? {};

   const valA =
     ordenCampo === "df"
       ? (boxA.gf ?? 0) - (boxA.gc ?? 0)
       : ordenCampo === "gp"
       ? (boxA.g ?? 0) - (boxA.p ?? 0)
       : boxA?.[ordenCampo] ?? 0;

   const valB =
     ordenCampo === "df"
       ? (boxB.gf ?? 0) - (boxB.gc ?? 0)
       : ordenCampo === "gp"
       ? (boxB.g ?? 0) - (boxB.p ?? 0)
       : boxB?.[ordenCampo] ?? 0;

    return ordenDireccion === "asc" ? valA - valB : valB - valA;
  });
    return sorted;
  }, [resumenes, ordenAmbito, ordenCampo, ordenDireccion]);
};

export default useEstadisticasMemo;

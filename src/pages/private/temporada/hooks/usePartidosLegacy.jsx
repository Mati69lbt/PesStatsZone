import React, { useMemo } from "react";

const usePartidosLegacy = (matches = []) => {
  return useMemo(
    () =>
      matches.map((m) => ({
        id: m.id,
        fecha: m.fecha,
        rival: m.rival,
        golesFavor: m.golFavor ?? 0,
        golesContra: m.golContra ?? 0,
        equipo: (m.captain || "").toLowerCase(),
        esLocal:
          String(m.condition || "")
            .trim()
            .toLowerCase() === "local",
      })),
    [matches]
  );
};

export default usePartidosLegacy;

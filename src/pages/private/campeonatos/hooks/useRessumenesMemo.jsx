// cspell: ignore Ressumenes
import React, { useMemo } from "react";
import { applyMatch, sumInit, temporadaKey } from "../util/funtions";

const useRessumenesMemo = (matches, torneosConfig = {}) => {
  return useMemo(() => {
    const acc = {};
    for (const m of matches) {
      const clave = temporadaKey({
        torneoName: m.torneoName,
        torneoYear: m.torneoYear,
        fecha: m.fecha,
        torneosConfig, // ✅ nuevo
      });

      if (!acc[clave]) {
        acc[clave] = {
          general: sumInit(),
          local: sumInit(),
          visitante: sumInit(),
        };
      }

      const gf = Number(m.golFavor) || 0;
      const gc = Number(m.golContra) || 0;

      const cond = String(m.condition || "")
        .trim()
        .toLowerCase();
      const esLocal = cond === "local";
      const esVisitante = cond === "visitante";

      // general (siempre)
      applyMatch(acc[clave].general, { esLocal, gf, gc });

      // ámbito (solo si es local o visitante)
      if (esLocal) {
        applyMatch(acc[clave].local, { esLocal: true, gf, gc });
      } else if (esVisitante) {
        applyMatch(acc[clave].visitante, { esLocal: false, gf, gc });
      }
      // si es neutro/neutral: NO lo contamos ni en local ni en visitante
    }
    return acc;
  }, [matches]);
};

export default useRessumenesMemo;

// cspell: ignore Ressumenes
import React, { useMemo } from "react";
import { applyMatch, sumInit, temporadaKey } from "../util/funtions";

const useRessumenesMemo = (matches) => {
  return useMemo(() => {
    const acc = {};
    for (const m of matches) {
      const clave = temporadaKey({
        torneoName: m.torneoName,
        torneoYear: m.torneoYear,
        fecha: m.fecha,
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
      const esLocal = (m.condition || "").toLowerCase() === "local";

      // general
      applyMatch(acc[clave].general, { esLocal, gf, gc });
      // ámbito
      applyMatch(esLocal ? acc[clave].local : acc[clave].visitante, {
        esLocal,
        gf,
        gc,
      });
    }
    return acc;
  }, [matches]);
};

export default useRessumenesMemo;

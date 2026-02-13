import React, { useMemo } from "react";
import { emptyTriple } from "../utils/funtions";
import { sumarFila } from "../../temporada/utils/Funciones";
import { getSeasonKeyForMatch } from "../utils/EuropeFuntions";


const useResumenTemporada = (
  matches = [],
  torneosConfig = {},
  mode = "anual",
) => {
  return useMemo(() => {
    const resumen = {};
    const captainsSet = new Set();

    for (const m of matches) {
      if (!m?.fecha) continue;

      const temp = getSeasonKeyForMatch(m, torneosConfig, mode);

      const cap = (m?.captain || "—").trim();
      captainsSet.add(cap);

      if (!resumen[temp])
        resumen[temp] = { general: emptyTriple(), capitanes: {} };
      if (!resumen[temp].capitanes[cap])
        resumen[temp].capitanes[cap] = emptyTriple();

      const gf = Number(m.golFavor || 0);
      const gc = Number(m.golContra || 0);
      const cond = String(m.condition || "")
        .trim()
        .toLowerCase();

      // General
      sumarFila(resumen[temp].general.General, gf, gc);

      if (cond === "local") sumarFila(resumen[temp].general.Local, gf, gc);
      else if (cond === "visitante")
        sumarFila(resumen[temp].general.Visitante, gf, gc);
      else if (
        cond === "neutral" ||
        cond === "neutro" ||
        cond === "neutro/neutral"
      ) {
        if (!resumen[temp].general.Neutral)
          resumen[temp].general.Neutral = emptyTriple().General;
        sumarFila(resumen[temp].general.Neutral, gf, gc);
      }

      // Capitán
      sumarFila(resumen[temp].capitanes[cap].General, gf, gc);
      if (cond === "local")
        sumarFila(resumen[temp].capitanes[cap].Local, gf, gc);
      else if (cond === "visitante")
        sumarFila(resumen[temp].capitanes[cap].Visitante, gf, gc);
      else if (
        cond === "neutral" ||
        cond === "neutro" ||
        cond === "neutro/neutral"
      ) {
        if (!resumen[temp].capitanes[cap].Neutral)
          resumen[temp].capitanes[cap].Neutral = emptyTriple().General;
        sumarFila(resumen[temp].capitanes[cap].Neutral, gf, gc);
      }
    }

    const temps = Object.keys(resumen).sort((a, b) => {
      const aY = parseInt(String(a).match(/\d{4}/)?.[0] || "0", 10);
      const bY = parseInt(String(b).match(/\d{4}/)?.[0] || "0", 10);
      return aY - bY;
    });

    const caps = [...captainsSet].sort((a, b) => a.localeCompare(b));

    return {
      temporadasOrdenadas: temps,
      resumenPorTemporada: resumen,
      captainsOrdenados: caps,
    };
  }, [matches, torneosConfig, mode]);
};

export default useResumenTemporada;

import { useMemo } from "react";

// buildFilasPorPeriodo.js — función pura, sin hooks
export const buildFilasPorPeriodo = (ms, getPeriodo, cond = null) => {
  if (!Array.isArray(ms) || ms.length === 0) return {};

  const porPeriodo = {};
  for (const match of ms) {
    const period = getPeriodo(match);
    if (!period) continue;

    if (cond) {
      const matchCond = String(match?.condition || "")
        .toLowerCase()
        .trim();
      if (matchCond !== cond) continue;
    }

    if (!porPeriodo[period]) porPeriodo[period] = [];
    porPeriodo[period].push(match);
  }
  return porPeriodo;
};

export const useListaHistorica = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, null, topN, "goals"),
    [all, topN],
  );

export const useListaHistoricaLocal = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, "local", topN, "goals"),
    [all, topN],
  );

// Y para Europa, mismo hook pero con getMatchSeason:
export const useListaHistoricaEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, null, topN, "goals"),
    [all, topN],
  );
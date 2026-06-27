import { useMemo } from "react";
import {
  calcularGolesGoleador,
  getMatchYear,
  getMatchSeason,
  buildLista,
  buildResumenPorPeriodo,
  buildListFromMap,
} from "./estAnuales";

// ─── HOOKS ANUALES (enero-diciembre) ─────────────────────────────────────────

export const useGoalsMaps = (all, years) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return null;

    const allowed = new Set((years || []).map(String));
    const allMap = {},
      pjMap = {},
      pjLocalMap = {},
      pjVisitanteMap = {};
    const localMap = {},
      visitanteMap = {},
      clubMap = {};
    const normCond = (c) =>
      String(c || "")
        .toLowerCase()
        .trim();

    for (const match of ms) {
      const y = getMatchYear(match);
      if (allowed.size > 0 && (!y || !allowed.has(String(y)))) continue;
      const cond = normCond(match?.condition);
      const participaron = new Set([
        ...(Array.isArray(match?.starters) ? match.starters : []),
        ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
      ]);
      participaron.forEach((pName) => {
        if (!pName) return;
        pjMap[pName] = (pjMap[pName] || 0) + 1;
        if (cond === "local") pjLocalMap[pName] = (pjLocalMap[pName] || 0) + 1;
        else if (cond === "visitante")
          pjVisitanteMap[pName] = (pjVisitanteMap[pName] || 0) + 1;
      });
      const scorers = Array.isArray(match?.goleadoresActiveClub)
        ? match.goleadoresActiveClub
        : [];
      for (const g of scorers) {
        if (g?.isOwnGoal) continue;
        const name = g?.name;
        const goles = calcularGolesGoleador(g);
        if (!name || goles <= 0) continue;
        allMap[name] = (allMap[name] || 0) + goles;
        clubMap[name] = match?.club;
        if (cond === "local") localMap[name] = (localMap[name] || 0) + goles;
        else if (cond === "visitante")
          visitanteMap[name] = (visitanteMap[name] || 0) + goles;
      }
    }
    return {
      all: allMap,
      pj: pjMap,
      local: localMap,
      visitante: visitanteMap,
      pjLocal: pjLocalMap,
      pjVisitante: pjVisitanteMap,
      club: clubMap,
    };
  }, [all, years]);

// Top goleadores por año
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
export const useListaHistoricaVisitante = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, "visitante", topN, "goals"),
    [all, topN],
  );

// Mejor promedio por año (mínimo 8 goles)
export const useListaMejorPromedio = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, null, topN, "prom", 8),
    [all, topN],
  );
export const useListaMejorPromedioLocal = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, "local", topN, "prom", 8),
    [all, topN],
  );
export const useListaMejorPromedioVisitante = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, "visitante", topN, "prom", 8),
    [all, topN],
  );

// Más PJ por año
export const useListaMasPJ = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, null, topN, "pj"),
    [all, topN],
  );
export const useListaMasPJLocal = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, "local", topN, "pj"),
    [all, topN],
  );
export const useListaMasPJVisitante = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchYear, "visitante", topN, "pj"),
    [all, topN],
  );

// Resumen goles por año
export const useResumenPorAño = (all) =>
  useMemo(() => buildResumenPorPeriodo(all?.matches, getMatchYear), [all]);

// ─── HOOKS EUROPEOS (julio-junio) ────────────────────────────────────────────

// Top goleadores por temporada
export const useListaHistoricaEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, null, topN, "goals"),
    [all, topN],
  );
export const useListaHistoricaLocalEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, "local", topN, "goals"),
    [all, topN],
  );
export const useListaHistoricaVisitanteEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, "visitante", topN, "goals"),
    [all, topN],
  );

// Mejor promedio por temporada (mínimo 8 goles)
export const useListaMejorPromedioEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, null, topN, "prom", 8),
    [all, topN],
  );
export const useListaMejorPromedioLocalEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, "local", topN, "prom", 8),
    [all, topN],
  );
export const useListaMejorPromedioVisitanteEuro = (all, topN) =>
  useMemo(
    () =>
      buildLista(all?.matches, getMatchSeason, "visitante", topN, "prom", 8),
    [all, topN],
  );

// Más PJ por temporada
export const useListaMasPJEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, null, topN, "pj"),
    [all, topN],
  );
export const useListaMasPJLocalEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, "local", topN, "pj"),
    [all, topN],
  );
export const useListaMasPJVisitanteEuro = (all, topN) =>
  useMemo(
    () => buildLista(all?.matches, getMatchSeason, "visitante", topN, "pj"),
    [all, topN],
  );

// Resumen goles por temporada
export const useResumenPorTemporada = (all) =>
  useMemo(() => buildResumenPorPeriodo(all?.matches, getMatchSeason), [all]);

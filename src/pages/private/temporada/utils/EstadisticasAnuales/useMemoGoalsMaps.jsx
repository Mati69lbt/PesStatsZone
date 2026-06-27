import { useMemo } from "react";
import { calcularGolesGoleador, getMatchYear } from "./estAnuales";

export const useGoalsMaps = (all, years) => {
  return useMemo(() => {
    const ms = all?.matches;

    if (!Array.isArray(ms) || ms.length === 0) return null;

    const allowed = new Set((years || []).map(String));
    const allMap = {};
    const pjMap = {};
    const pjLocalMap = {};
    const pjVisitanteMap = {};
    const localMap = {};
    const visitanteMap = {};
    const clubMap = {};

    const normCond = (c) =>
      String(c || "")
        .toLowerCase()
        .trim();

    for (const match of ms) {
      const y = getMatchYear(match);
      if (allowed.size > 0 && (!y || !allowed.has(String(y)))) continue;

      const cond = normCond(match?.condition); // "local", "visitante" o "neutral"

      // 1. LÓGICA DE PARTIDOS JUGADOS (PJ) - Acceso directo a match
      const starters = Array.isArray(match?.starters) ? match.starters : [];
      const substitutes = Array.isArray(match?.substitutes)
        ? match.substitutes
        : [];

      // Unimos y usamos Set para evitar duplicados en el mismo partido
      const participaron = new Set([...starters, ...substitutes]);

      participaron.forEach((pName) => {
        if (!pName) return;

        // PJ General
        pjMap[pName] = (pjMap[pName] || 0) + 1;

        // PJ por Condición (ignorando neutrales para las tablas específicas)
        if (cond === "local") {
          pjLocalMap[pName] = (pjLocalMap[pName] || 0) + 1;
        } else if (cond === "visitante") {
          pjVisitanteMap[pName] = (pjVisitanteMap[pName] || 0) + 1;
        }
      });

      // 2. LÓGICA DE GOLEADORES
      const scorers = Array.isArray(match?.goleadoresActiveClub)
        ? match.goleadoresActiveClub
        : [];

      for (const g of scorers) {
        if (g?.isOwnGoal) continue;

        const name = g?.name;
        const goles = calcularGolesGoleador(g);

        if (!name || goles <= 0) continue;

        // Sumar al total general
        allMap[name] = (allMap[name] || 0) + goles;
        clubMap[name] = match?.club;

        // Sumar según condición del partido
        if (cond === "local") {
          localMap[name] = (localMap[name] || 0) + goles;
        } else if (cond === "visitante") {
          visitanteMap[name] = (visitanteMap[name] || 0) + goles;
        }
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
};

export const useListaHistorica = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    // agrupar matches por año
    const porAño = {};
    for (const match of ms) {
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    // para cada año, calcular goles por jugador
    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        // PJ
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
        });

        // Goles
        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
          clubMap[name] = match?.club;
        }
      }

      // convertir a filas
      for (const [name, goals] of Object.entries(golesMap)) {
        const pj = pjMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, topN);
  }, [all, topN]);

// AGREGAR al final del archivo
export const useListaHistoricaLocal = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const cond = String(match?.condition || "")
        .toLowerCase()
        .trim();
      if (cond !== "local") continue; // ← solo locales
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
          clubMap[name] = match?.club;
        }
      }

      for (const [name, goals] of Object.entries(golesMap)) {
        const pj = pjMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, topN);
  }, [all, topN]);

export const useListaHistoricaVisitante = (all, topN) =>
  useMemo(() => {
    // idéntico pero con cond !== "visitante"
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const cond = String(match?.condition || "")
        .toLowerCase()
        .trim();
      if (cond !== "visitante") continue; // ← solo visitantes
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
          clubMap[name] = match?.club;
        }
      }

      for (const [name, goals] of Object.entries(golesMap)) {
        const pj = pjMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, topN);
  }, [all, topN]);

// AGREGAR al final
export const useListaMejorPromedio = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
          clubMap[name] = match?.club;
        }
      }

      for (const [name, goals] of Object.entries(golesMap)) {
        const pj = pjMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .filter((x) => x.goals > 8)
      .sort(
        (a, b) =>
          b.prom - a.prom || b.goals - a.goals || a.name.localeCompare(b.name),
      )
      .slice(0, topN);
  }, [all, topN]);

export const useListaMejorPromedioLocal = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const cond = String(match?.condition || "")
        .toLowerCase()
        .trim();
      if (cond !== "local") continue;
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
          clubMap[name] = match?.club;
        }
      }

      for (const [name, goals] of Object.entries(golesMap)) {
        const pj = pjMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .filter((x) => x.goals > 8)
      .sort(
        (a, b) =>
          b.prom - a.prom || b.goals - a.goals || a.name.localeCompare(b.name),
      )
      .slice(0, topN);
  }, [all, topN]);

export const useListaMejorPromedioVisitante = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const cond = String(match?.condition || "")
        .toLowerCase()
        .trim();
      if (cond !== "visitante") continue;
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
          clubMap[name] = match?.club;
        }
      }

      for (const [name, goals] of Object.entries(golesMap)) {
        const pj = pjMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .filter((x) => x.goals > 8)
      .sort(
        (a, b) =>
          b.prom - a.prom || b.goals - a.goals || a.name.localeCompare(b.name),
      )
      .slice(0, topN);
  }, [all, topN]);

// AGREGAR al final de useMemoGoalsMaps.jsx

export const useListaMasPJ = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
          clubMap[p] = match?.club;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
        }
      }

      for (const [name, pj] of Object.entries(pjMap)) {
        const goals = golesMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .sort(
        (a, b) =>
          b.pj - a.pj || b.goals - a.goals || a.name.localeCompare(b.name),
      )
      .slice(0, topN);
  }, [all, topN]);

export const useListaMasPJLocal = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const cond = String(match?.condition || "")
        .toLowerCase()
        .trim();
      if (cond !== "local") continue;
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
          clubMap[p] = match?.club;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
        }
      }

      for (const [name, pj] of Object.entries(pjMap)) {
        const goals = golesMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .sort(
        (a, b) =>
          b.pj - a.pj || b.goals - a.goals || a.name.localeCompare(b.name),
      )
      .slice(0, topN);
  }, [all, topN]);

export const useListaMasPJVisitante = (all, topN) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return [];

    const porAño = {};
    for (const match of ms) {
      const cond = String(match?.condition || "")
        .toLowerCase()
        .trim();
      if (cond !== "visitante") continue;
      const y = getMatchYear(match);
      if (!y) continue;
      if (!porAño[y]) porAño[y] = [];
      porAño[y].push(match);
    }

    const filas = [];
    for (const [year, matchesDelAño] of Object.entries(porAño)) {
      const golesMap = {};
      const pjMap = {};
      const clubMap = {};

      for (const match of matchesDelAño) {
        const participaron = new Set([
          ...(Array.isArray(match?.starters) ? match.starters : []),
          ...(Array.isArray(match?.substitutes) ? match.substitutes : []),
        ]);
        participaron.forEach((p) => {
          if (!p) return;
          pjMap[p] = (pjMap[p] || 0) + 1;
          clubMap[p] = match?.club;
        });

        const scorers = Array.isArray(match?.goleadoresActiveClub)
          ? match.goleadoresActiveClub
          : [];
        for (const g of scorers) {
          if (g?.isOwnGoal) continue;
          const name = g?.name;
          const goles = calcularGolesGoleador(g);
          if (!name || goles <= 0) continue;
          golesMap[name] = (golesMap[name] || 0) + goles;
        }
      }

      for (const [name, pj] of Object.entries(pjMap)) {
        const goals = golesMap[name] || 0;
        filas.push({
          name,
          club: clubMap[name] || "",
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
          year,
        });
      }
    }

    return filas
      .sort(
        (a, b) =>
          b.pj - a.pj || b.goals - a.goals || a.name.localeCompare(b.name),
      )
      .slice(0, topN);
  }, [all, topN]);

  // AGREGAR al final de useMemoGoalsMaps.jsx
export const useResumenPorAño = (all) =>
  useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return { general: [], local: [], visitante: [] };

    const general = {};
    const local = {};
    const visitante = {};

    for (const match of ms) {
      const y = getMatchYear(match);
      if (!y) continue;

      const cond = String(match?.condition || "").toLowerCase().trim();
      const scorers = Array.isArray(match?.goleadoresActiveClub) ? match.goleadoresActiveClub : [];

      let golesPartido = 0;
      for (const g of scorers) {
        if (g?.isOwnGoal) continue;
        const goles = calcularGolesGoleador(g);
        golesPartido += goles;
      }

      general[y] = (general[y] || 0) + golesPartido;
      if (cond === "local") local[y] = (local[y] || 0) + golesPartido;
      if (cond === "visitante") visitante[y] = (visitante[y] || 0) + golesPartido;
    }

    const toFilas = (map) =>
      Object.entries(map)
        .map(([year, goals]) => ({ year, goals }))
        .sort((a, b) => b.goals - a.goals);

    return {
      general: toFilas(general),
      local: toFilas(local),
      visitante: toFilas(visitante),
    };
  }, [all]);
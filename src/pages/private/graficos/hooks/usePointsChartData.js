import { useMemo } from "react";
import {
  buildPointsChartData,
  getTournaments,
  getTopCaptains,
  getYears,
  sortMatchesChronologically,
} from "../utils/pointsSeries";

export function usePointsChartData(
  matches,
  {
    view,
    breakdown,
    selectedYear,
    selectedTournament,
    torneosConfig,
    capA,
    capB,
  } = {},
) {
  return useMemo(() => {
    const safe = Array.isArray(matches) ? matches : [];
    const sorted = sortMatchesChronologically(safe);

    // --- helpers (evitar "Bundesliga 2023 2023") ---
    const stripYears = (name = "") =>
      name
        .toString()
        .replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, "")
        .replace(/\b(19|20)\d{2}\b/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    const norm = (s) =>
      (s || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const getFormato = (tName) => {
      if (!torneosConfig || !tName) return "anual";
      const target = norm(stripYears(tName));
      for (const [k, v] of Object.entries(torneosConfig || {})) {
        if (norm(stripYears(k)) === target) {
          const f = (v?.formato ?? "").toString().trim().toLowerCase();
          return f === "europeo" ? "europeo" : "anual"; // "" => anual
        }
      }
      return "anual";
    };

    const getEuroSeasonKey = (fechaISO) => {
      const d = new Date(fechaISO);
      if (!Number.isFinite(d.getTime())) return null;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const startYear = month >= 7 ? year : year - 1;
      return `${startYear}-${startYear + 1}`; // 2017-2018
    };

    // Solo partidos de torneos europeos (según torneosConfig)
    const euroMatches = sorted.filter((m) => {
      const t = m?.torneoDisplay || m?.torneoName || "";
      return getFormato(t) === "europeo";
    });

    const isEuroYear = breakdown === "euroYear";
    const isEuroTournament = breakdown === "euroTournament";

    // Options para selects
    const years = isEuroYear
      ? Array.from(
          new Set(
            euroMatches.map((m) => getEuroSeasonKey(m?.fecha)).filter(Boolean),
          ),
        ).sort((a, b) => Number(b.split("-")[0]) - Number(a.split("-")[0]))
      : getYears(sorted);

    const tournaments = isEuroTournament
      ? Array.from(
          new Set(
            euroMatches
              .map((m) => {
                const raw = m?.torneoDisplay || m?.torneoName || "Sin torneo";
                const base = stripYears(raw);
                const season = getEuroSeasonKey(m?.fecha);
                return season ? `${base} ${season}` : base;
              })
              .filter(Boolean),
          ),
        ).sort((a, b) => {
          const ya = a.match(/(19|20)\d{2}-(19|20)\d{2}/)?.[0];
          const yb = b.match(/(19|20)\d{2}-(19|20)\d{2}/)?.[0];
          if (ya && yb) {
            const da = Number(ya.split("-")[0]);
            const db = Number(yb.split("-")[0]);
            if (da !== db) return db - da;
          }
          return String(a).localeCompare(String(b));
        })
      : getTournaments(sorted);

    const [autoA, autoB] = getTopCaptains(sorted);
    const captainA = capA || autoA || "";
    const captainB = capB || autoB || "";

    // Subset a graficar según modo elegido
    let subset = sorted;

    if (breakdown === "year" && selectedYear) {
      subset = sorted.filter(
        (m) => Number(m?.torneoYear) === Number(selectedYear),
      );
    }

    if (breakdown === "euroYear" && selectedYear) {
      subset = euroMatches.filter(
        (m) => getEuroSeasonKey(m?.fecha) === selectedYear,
      );
    }

    if (breakdown === "tournament" && selectedTournament) {
      subset = sorted.filter((m) => {
        const t = m?.torneoDisplay || m?.torneoName;
        return t === selectedTournament;
      });
    }

    if (breakdown === "euroTournament" && selectedTournament) {
      subset = euroMatches.filter((m) => {
        const raw = m?.torneoDisplay || m?.torneoName || "Sin torneo";
        const base = stripYears(raw);
        const season = getEuroSeasonKey(m?.fecha);
        const key = season ? `${base} ${season}` : base;
        return key === selectedTournament;
      });
    }

    const chart = buildPointsChartData(subset, captainA, captainB);

    const allowedKinds =
      view === "general"
        ? new Set(["unificado", "mitadU"])
        : new Set(["capA", "capB", "mitadA", "mitadB"]);

    const filteredDatasets = chart.datasets.filter((ds) =>
      allowedKinds.has(ds._kind),
    );

    const yMax =
      view === "general"
        ? chart.meta.posiblesU
        : Math.max(chart.meta.posiblesA, chart.meta.posiblesB);

    return {
      years,
      tournaments,
      captainA,
      captainB,
      chartData: { labels: chart.labels, datasets: filteredDatasets },
      yMax,
      meta: chart.meta,
    };
  }, [
    matches,
    view,
    breakdown,
    selectedYear,
    selectedTournament,
    torneosConfig,
    capA,
    capB,
  ]);
}

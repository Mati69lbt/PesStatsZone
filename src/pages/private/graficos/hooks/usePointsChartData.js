import { useMemo } from "react";
import {
  buildPointsChartData,
  getTournaments,
  getTopCaptains,
  getYears,
  sortMatchesChronologically,
} from "../utils/pointsSeries";
import { pretty } from "../../match/utils/pretty";

export function usePointsChartData(
  matches,
  {
    view, // "general" | "capitanes" (por ahora ambos muestran 3 líneas; después si querés lo hacemos distinto)
    breakdown, // "all" | "year" | "tournament"
    selectedYear,
    selectedTournament,
    capA,
    capB,
  } = {}
) {
  return useMemo(() => {
    const safe = Array.isArray(matches) ? matches : [];
    const sorted = sortMatchesChronologically(safe);

    const years = getYears(sorted);
    const tournaments = getTournaments(sorted);
    const [autoA, autoB] = getTopCaptains(sorted);

    const captainA = capA || autoA || "";

    const captainB = capB || autoB || "";

    let subset = sorted;

    if (breakdown === "year" && selectedYear) {
      subset = sorted.filter(
        (m) => Number(m?.torneoYear) === Number(selectedYear)
      );
    }

    if (breakdown === "tournament" && selectedTournament) {
      subset = sorted.filter((m) => {
        const t = m?.torneoDisplay || m?.torneoName;
        return t === selectedTournament;
      });
    }

    const chart = buildPointsChartData(subset, captainA, captainB);

    // ✅ filtrar según vista
    const allowedKinds =
      view === "general"
        ? new Set(["unificado", "mitadU"])
        : new Set(["capA", "capB", "mitadA", "mitadB"]);

    const filteredDatasets = chart.datasets.filter((ds) =>
      allowedKinds.has(ds._kind)
    );

    // ✅ yMax correcto según vista (mejora MUCHO la legibilidad)
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
  }, [matches, view, breakdown, selectedYear, selectedTournament, capA, capB]);
}

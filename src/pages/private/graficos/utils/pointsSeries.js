import { pretty } from "../../match/utils/pretty";

export function sortMatchesChronologically(matches = []) {
  return [...matches].sort((a, b) => {
    const da = new Date(a?.fecha ?? 0).getTime();
    const db = new Date(b?.fecha ?? 0).getTime();
    if (da !== db) return da - db;
    return (a?.createdAt ?? 0) - (b?.createdAt ?? 0);
  });
}

export function getYears(matches = []) {
  return Array.from(
    new Set(matches.map((m) => m?.torneoYear).filter(Boolean))
  ).sort((a, b) => a - b);
}

export function getTournaments(matches = []) {
  // usamos torneoDisplay si existe (queda “Torneo X 2012”), sino torneoName
  const set = new Set(
    matches.map((m) => m?.torneoDisplay || m?.torneoName).filter(Boolean)
  );
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getTopCaptains(matches = []) {
  const freq = new Map();
  for (const m of matches) {
    const c = m?.captain;
    if (!c) continue;
    freq.set(c, (freq.get(c) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);
}

/**
 * Arma 3 líneas: capA, capB, unificado + líneas mitad (capA, capB, unificado)
 * X = partido global (1..N) del subset ya filtrado (año/campeonato)
 */
export function buildPointsChartData(matchesSubset, capA, capB) {
  const sorted = sortMatchesChronologically(matchesSubset);

  let acumA = 0,
    acumB = 0,
    acumU = 0;
  let gamesA = 0,
    gamesB = 0,
    gamesU = 0;

  const labels = [];
  const puntosA = [];
  const puntosB = [];
  const puntosU = [];

  sorted.forEach((m, idx) => {
    const pts = Number(m?.points ?? 0);
    labels.push(String(idx + 1));

    // unificado
    acumU += pts;
    gamesU += 1;

    // capitanes (se “planchan” cuando no juegan)
    if (m?.captain === capA) {
      acumA += pts;
      gamesA += 1;
    }
    if (m?.captain === capB) {
      acumB += pts;
      gamesB += 1;
    }

    puntosA.push(acumA);
    puntosB.push(acumB);
    puntosU.push(acumU);
  });

  const posiblesA = gamesA * 3;
  const posiblesB = gamesB * 3;
  const posiblesU = gamesU * 3;

  const mitadA = posiblesA / 2;
  const mitadB = posiblesB / 2;
  const mitadU = posiblesU / 2;

  const mitadArrA = Array(labels.length).fill(mitadA);
  const mitadArrB = Array(labels.length).fill(mitadB);
  const mitadArrU = Array(labels.length).fill(mitadU);

  const yMax = posiblesU; // techo = posibles del unificado (en ese subset)

  return {
    labels,
    yMax,
    meta: { gamesA, gamesB, gamesU, posiblesA, posiblesB, posiblesU },
    datasets: [
      {
        _kind: "unificado",
        label: "Unificado",
        data: puntosU,
        borderColor: "#22c55e",
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.35,
      },
      {
        _kind: "capA",
        label: pretty(capA || "Cap A"),
        data: puntosA,
        borderColor: "#0ea5e9",
        borderWidth: 2.2,
        pointRadius: 0,
        tension: 0.35,
      },
      {
        _kind: "capB",
        label: pretty(capB || "Cap B"),
        data: puntosB,
        borderColor: "#f97316",
        borderWidth: 2.2,
        pointRadius: 0,
        tension: 0.35,
      },
      {
        _kind: "mitadU",
        label: "Mitad Unificado",
        data: mitadArrU,
        borderColor: "#94a3b8",
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [4, 6],
        tension: 0,
      },
      {
        _kind: "mitadA",
        label: `Mitad ${pretty(capA)}`,
        data: mitadArrA,
        borderColor: "#38bdf8",
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [6, 4],
        tension: 0,
      },
      {
        _kind: "mitadB",
        label: `Mitad ${pretty(capB)}`,
        data: mitadArrB,
        borderColor: "#fdba74",
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [6, 4],
        tension: 0,
      },
    ],
  };
}

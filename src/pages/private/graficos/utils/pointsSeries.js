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
export function buildPointsChartData(matchesSubset, capAOrCaptains, capB) {
  const sorted = sortMatchesChronologically(matchesSubset);

  const captainsRaw = Array.isArray(capAOrCaptains)
    ? capAOrCaptains
    : [capAOrCaptains, capB];

  const captains = Array.from(new Set((captainsRaw || []).filter(Boolean)));

  let acumU = 0;
  let gamesU = 0;

  const acumByCaptain = Object.fromEntries(captains.map((c) => [c, 0]));
  const gamesByCaptain = Object.fromEntries(captains.map((c) => [c, 0]));

  const labels = [];
  const puntosU = [];
  const puntosByCaptain = Object.fromEntries(captains.map((c) => [c, []]));

  sorted.forEach((m, idx) => {
    const pts = Number(m?.points ?? 0);
    const cap = m?.captain;

    labels.push(String(idx + 1));

    // unificado
    acumU += pts;
    gamesU += 1;
    puntosU.push(acumU);

    // capitanes (se “planchan” cuando no juegan)
    if (cap && acumByCaptain[cap] != null) {
      acumByCaptain[cap] += pts;
      gamesByCaptain[cap] += 1;
    }

    // empujar el valor actual para todos
    for (const c of captains) {
      puntosByCaptain[c].push(acumByCaptain[c]);
    }
  });

  const posiblesU = gamesU * 3;
  const mitadU = posiblesU / 2;

  const posiblesByCaptain = Object.fromEntries(
    captains.map((c) => [c, (gamesByCaptain[c] || 0) * 3]),
  );
  const mitadByCaptain = Object.fromEntries(
    captains.map((c) => [c, (posiblesByCaptain[c] || 0) / 2]),
  );

  const mitadArrU = Array(labels.length).fill(mitadU);

  // Colores: mantenemos 2 “clásicos” y sumamos extras
  const colors = [
    "#0ea5e9",
    "#f97316",
    "#a855f7",
    "#14b8a6",
    "#eab308",
    "#ef4444",
    "#6366f1",
    "#10b981",
  ];

  const datasets = [
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
      _kind: "mitadU",
      label: "Mitad Unificado",
      data: mitadArrU,
      borderColor: "#94a3b8",
      borderWidth: 2,
      pointRadius: 0,
      borderDash: [4, 6],
      tension: 0,
    },
  ];

  captains.forEach((c, i) => {
    datasets.push({
      _kind: `cap:${c}`,
      label: pretty(c),
      data: puntosByCaptain[c],
      borderColor: colors[i % colors.length],
      borderWidth: 2.2,
      pointRadius: 0,
      tension: 0.35,
    });

    datasets.push({
      _kind: `mitad:${c}`,
      label: `Mitad ${pretty(c)}`,
      data: Array(labels.length).fill(mitadByCaptain[c]),
      borderColor: colors[i % colors.length],
      borderWidth: 2,
      pointRadius: 0,
      borderDash: [6, 4],
      tension: 0,
    });
  });

  return {
    labels,
    yMax: posiblesU,
    meta: { posiblesU, posiblesByCaptain, gamesByCaptain },
    datasets,
  };
}

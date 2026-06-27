// cspell: ignore funtions

export const calcularGolesGoleador = (g) => {
  if (!g) return 0;
  const t = !!(g.triplete || g.hattrick);
  if (t && g.doblete && g.gol) return 6;
  if (t && g.doblete) return 5;
  if (t && g.gol) return 4;
  if (t) return 3;
  if (g.doblete) return 2;
  if (g.gol) return 1;
  return 0;
};

export const getMatchYear = (m) => {
  const y = m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio;
  if (y !== undefined && y !== null) return String(y);
  const key =
    m?.torneoKey || m?.tournamentKey || m?.torneo || m?.competitionKey || "";
  const mm = String(key).match(/(\d{4})/);
  return mm ? mm[1] : null;
};

export const getMatchSeason = (m) => {
  const raw = m?.fecha || m?.createdAt;
  if (raw) {
    const d =
      typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ? new Date(`${raw}T00:00:00`)
        : new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }
  }
  return null;
};

export const buildListFromMap = (map, limit, pjMapSource, clubMapSource) =>
  Object.entries(map || {})
    .map(([name, goals]) => {
      const pj = pjMapSource?.[name] || 0;
      return {
        name,
        goals,
        pj,
        prom: pj > 0 ? goals / pj : 0,
        club: clubMapSource?.[name] || "",
      };
    })
    .filter((x) => x.goals > 0)
    .sort((a, b) => {
      const diff = b.goals - a.goals;
      if (diff !== 0) return diff;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    })
    .slice(0, limit);

// ─── FUNCIÓN GENÉRICA ────────────────────────────────────────────────────────
// getPeriodo: función que recibe un match y devuelve el período (año o temporada)
// cond: "local" | "visitante" | null (general)
// sortBy: "goals" | "prom" | "pj"
// minGoles: mínimo de goles para entrar al ranking (solo aplica a goals y prom)

export const buildLista = (
  ms,
  getPeriodo,
  cond,
  topN,
  sortBy = "goals",
  minGoles = 0,
) => {
  if (!Array.isArray(ms) || ms.length === 0) return [];

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

  const filas = [];
  for (const [year, matchesDelPeriodo] of Object.entries(porPeriodo)) {
    const golesMap = {};
    const pjMap = {};
    const clubMap = {};

    for (const match of matchesDelPeriodo) {
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

    // Para sortBy "pj": iterar pjMap; para el resto: iterar golesMap
    const source = sortBy === "pj" ? pjMap : golesMap;
    for (const [name, val] of Object.entries(source)) {
      const goals = golesMap[name] || 0;
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
    .filter((x) => x.goals >= minGoles)
    .sort((a, b) => {
      if (sortBy === "prom")
        return (
          b.prom - a.prom || b.goals - a.goals || a.name.localeCompare(b.name)
        );
      if (sortBy === "pj")
        return b.pj - a.pj || b.goals - a.goals || a.name.localeCompare(b.name);
      return b.goals - a.goals || a.name.localeCompare(b.name);
    })
    .slice(0, topN);
};

// ─── FUNCIÓN GENÉRICA RESUMEN POR PERÍODO ────────────────────────────────────
export const buildResumenPorPeriodo = (ms, getPeriodo) => {
  if (!Array.isArray(ms) || ms.length === 0)
    return { general: [], local: [], visitante: [] };

  const general = {};
  const local = {};
  const visitante = {};

  for (const match of ms) {
    const period = getPeriodo(match);
    if (!period) continue;
    const cond = String(match?.condition || "")
      .toLowerCase()
      .trim();
    const scorers = Array.isArray(match?.goleadoresActiveClub)
      ? match.goleadoresActiveClub
      : [];

    let golesPartido = 0;
    for (const g of scorers) {
      if (g?.isOwnGoal) continue;
      golesPartido += calcularGolesGoleador(g);
    }

    general[period] = (general[period] || 0) + golesPartido;
    if (cond === "local") local[period] = (local[period] || 0) + golesPartido;
    if (cond === "visitante")
      visitante[period] = (visitante[period] || 0) + golesPartido;
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
};

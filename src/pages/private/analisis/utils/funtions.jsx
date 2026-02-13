export const emptyRow = () => ({
  pj: 0,
  g: 0,
  e: 0,
  p: 0,
  gf: 0,
  gc: 0,
  dif: 0,
});
export const emptyTriple = () => ({
  General: emptyRow(),
  Local: emptyRow(),
  Visitante: emptyRow(),
  Neutral: emptyRow(),
});

export function sumInto(dst, m) {
  dst.pj += 1;
  const gf = Number(m.golFavor || 0);
  const gc = Number(m.golContra || 0);
  dst.gf += gf;
  dst.gc += gc;
  if (gf > gc) dst.g += 1;
  else if (gf === gc) dst.e += 1;
  else dst.p += 1;
  dst.dif = dst.gf - dst.gc;
}

export function addMatchToTriple(triple, m) {
  // siempre suma a General
  sumInto(triple.General, m);

  // normaliza condition
  const cond = String(m?.condition || "")
    .trim()
    .toLowerCase();
  if (cond === "local") {
    sumInto(triple.Local, m);
  } else if (cond === "visitante") {
    sumInto(triple.Visitante, m);
  } else if (cond === "neutro" || cond === "neutral") {
    sumInto(triple.Neutral, m);
  } else {
    // valores inesperados: también sólo General (fail-safe)
  }
}

export function buildBreakdown(matches, torneosConfig = {}) {
  const stripYears = (name = "") => {
    return name
      .toString()
      .replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, "") // rango
      .replace(/\b(19|20)\d{2}\b/g, "") // año suelto
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const norm = (s) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const getFormato = (torneosConfig, torneoName) => {
    if (!torneosConfig || !torneoName) return "anual";

    const target = norm(stripYears(torneoName));
    for (const [k, v] of Object.entries(torneosConfig)) {
      if (norm(stripYears(k)) === target) {
        const f = (v?.formato ?? "").toString().trim().toLowerCase();
        return f === "europeo" ? "europeo" : "anual"; // "" => anual
      }
    }
    return "anual";
  };

  const getSeasonLabel = (m, formato) => {
    const d = new Date(m?.fecha);
    if (!Number.isFinite(d.getTime())) return "N/A";

    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    if (formato === "europeo") {
      const startYear = month >= 7 ? year : year - 1;
      return `${startYear}-${startYear + 1}`; // <-- como querés: 2022-2023
    }

    return String(year); // anual: 2022
  };

  const getTs = (m) => {
    const c = m?.createdAt;
    if (typeof c === "number") return c;
    if (c && typeof c.toMillis === "function") return c.toMillis();
    if (c && typeof c.seconds === "number") return c.seconds * 1000;

    if (m?.fecha) {
      const d = new Date(m.fecha);
      if (Number.isFinite(d.getTime())) return d.getTime();
    }
    return 0;
  };

  const byCaptain = new Map(); // captain => { captain, total, byTournament, tourneyMaxTs }

  for (const m of matches || []) {
    const captain = (m?.captain || "—").trim();

    if (!byCaptain.has(captain)) {
      byCaptain.set(captain, {
        captain,
        total: emptyTriple(),
        byTournament: {},
        tourneyMaxTs: {},
      });
    }

    const node = byCaptain.get(captain);

    // Totales del capitán (no cambia)
    addMatchToTriple(node.total, m);

    const torneoRaw = m?.torneoDisplay || "Sin torneo";
    const torneoBase = stripYears(torneoRaw); // <-- clave

    const formato = getFormato(torneosConfig, torneoBase);
    const season = getSeasonLabel(m, formato);

    const tKey = `${torneoBase} ${season}`; 

    if (!node.byTournament[tKey]) node.byTournament[tKey] = emptyTriple();
    addMatchToTriple(node.byTournament[tKey], m);

    const ts = getTs(m);
    node.tourneyMaxTs[tKey] = Math.max(node.tourneyMaxTs[tKey] || 0, ts);
  }

  // capitanes alfabético
  const captains = [...byCaptain.values()].sort((a, b) =>
    a.captain.localeCompare(b.captain),
  );

  // orden global de torneos por recencia (para alinear)
  const allTournaments = new Map();
  captains.forEach((c) => {
    Object.entries(c.tourneyMaxTs).forEach(([name, ts]) => {
      allTournaments.set(name, Math.max(allTournaments.get(name) || 0, ts));
    });
  });

  const tournamentsOrdered = [...allTournaments.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return { captains, tournamentsOrdered };
}

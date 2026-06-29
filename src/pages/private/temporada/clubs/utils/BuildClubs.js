// cspell: ignore funtions

export const getMatchYear = (m) => {
  const fecha = m?.fecha;
  if (!fecha) return null;
  const d = new Date(fecha);
  if (!Number.isFinite(d.getTime())) return null;
  return String(d.getFullYear());
};

export const getMatchSeason = (m) => {
  const fecha = m?.fecha;
  if (!fecha) return null;
  const d = new Date(
    typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ? `${fecha}T00:00:00`
      : fecha,
  );
  if (!Number.isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }
  return null;
};

export const BuildClubs = (allMatches, getPeriodo) => {
  if (!Array.isArray(allMatches) || allMatches.length === 0) return [];

  const map = new Map(); // key: "club__periodo"

  for (const match of allMatches) {
    const club = (match?.club || "").trim();
    const periodo = getPeriodo(match);
    if (!club || !periodo) continue;

    const key = `${club}__${periodo}`;

    if (!map.has(key)) {
      map.set(key, {
        club,
        periodo,
        pj: 0,
        g: 0,
        e: 0,
        p: 0,
        gf: 0,
        gc: 0,
        dif: 0,
        local: { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0 },
        visitante: { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0 },
        neutral: { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0 },
      });
    }

    const row = map.get(key);
    const gf = Number(match?.golFavor || 0);
    const gc = Number(match?.golContra || 0);
    const outcome = gf > gc ? "g" : gf < gc ? "p" : "e";

    // general
    row.pj += 1;
    row.gf += gf;
    row.gc += gc;
    row[outcome] += 1;
    row.dif = row.gf - row.gc;

    // por condición
    const cond = String(match?.condition || "")
      .toLowerCase()
      .trim();
    const sub =
      cond === "local"
        ? row.local
        : cond === "visitante"
          ? row.visitante
          : cond === "neutro" || cond === "neutral"
            ? row.neutral
            : null;

    if (sub) {
      sub.pj += 1;
      sub.gf += gf;
      sub.gc += gc;
      sub[outcome] += 1;
      sub.dif = sub.gf - sub.gc;
    }
  }

  return Array.from(map.values()).map((row) => ({
    ...row,
    gp: row.g - row.p,
    pts: row.g * 3 + row.e,
    posibles: row.pj * 3,
    efec:
      row.pj > 0 ? Math.round(((row.g * 3 + row.e) / (row.pj * 3)) * 100) : 0,
  }));
};

export const SORT_FIELDS_CLUBS = [
  { key: "club", label: "🏟️" },
  { key: "pj", label: "PJ" },
  { key: "g", label: "G" },
  { key: "e", label: "E" },
  { key: "p", label: "P" },
  { key: "gp", label: "G/P" },
  { key: "gf", label: "GF" },
  { key: "gc", label: "GC" },
  { key: "dif", label: "DIF" },
  { key: "efec", label: "%" },
];

export const sortClubs = (list, field, dir, condKey = null) => {
  return [...list].sort((a, b) => {
    let valA, valB;

    const srcA = condKey ? (a[condKey] ?? {}) : a;
    const srcB = condKey ? (b[condKey] ?? {}) : b;

    if (field === "club") {
      valA = `${a.club} ${a.periodo}`.toLowerCase();
      valB = `${b.club} ${b.periodo}`.toLowerCase();
      return dir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else if (field === "efec") {
      const calcEfec = (src) => {
        const pj = src?.pj || 0;
        const g = src?.g || 0;
        const e = src?.e || 0;
        return pj > 0 ? (g * 3 + e) / (pj * 3) : 0;
      };
      valA = calcEfec(srcA);
      valB = calcEfec(srcB);
    } else if (field === "gp") {
      valA = (srcA?.g ?? 0) - (srcA?.p ?? 0);
      valB = (srcB?.g ?? 0) - (srcB?.p ?? 0);
    } else {
      valA = srcA?.[field] ?? 0;
      valB = srcB?.[field] ?? 0;
    }

    return dir === "asc" ? valA - valB : valB - valA;
  });
};

// cspell: ignore funtions

export const buildCaptains = (allMatches) => {
  if (!Array.isArray(allMatches) || allMatches.length === 0) return [];

  const map = new Map(); // key: "captain__club"

  for (const match of allMatches) {
    const captain = (match?.captain || "").trim();
    const club = (match?.club || "").trim();
    if (!captain || !club) continue;

    const key = `${captain}__${club}`;

    if (!map.has(key)) {
      map.set(key, {
        captain,
        club,
        pj: 0,
        g: 0,
        e: 0,
        p: 0,
        gf: 0,
        gc: 0,
        dif: 0,
        // por condición
        local: { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0 },
        visitante: { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0 },
        neutral: { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0 },
        minYear: Infinity,
        maxYear: -Infinity,
      });
    }

    const row = map.get(key);

    // rango de años
    const fecha = match?.fecha;
    if (fecha) {
      const y = new Date(fecha).getFullYear();
      if (Number.isFinite(y)) {
        if (y < row.minYear) row.minYear = y;
        if (y > row.maxYear) row.maxYear = y;
      }
    }

    const gf = Number(match?.golFavor || 0);
    const gc = Number(match?.golContra || 0);
    const outcome = gf > gc ? "g" : gf < gc ? "p" : "e";

    // sumar general
    row.pj += 1;
    row.gf += gf;
    row.gc += gc;
    row[outcome] += 1;
    row.dif = row.gf - row.gc;

    // sumar por condición
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
    yearRange:
      row.minYear === Infinity
        ? "—"
        : row.minYear === row.maxYear
          ? String(row.minYear)
          : `${row.minYear} - ${row.maxYear}`,
    gp: row.g - row.p,
    pts: row.g * 3 + row.e,
    posibles: row.pj * 3,
    efec:
      row.pj > 0 ? Math.round(((row.g * 3 + row.e) / (row.pj * 3)) * 100) : 0,
  }));
};

export const SORT_FIELDS = [
  { key: "nombre", label: "🧤" },
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

export const sortCaptains = (list, field, dir, condKey = null) => {
  return [...list].sort((a, b) => {
    let valA, valB;

    const srcA = condKey ? (a[condKey] ?? {}) : a;
    const srcB = condKey ? (b[condKey] ?? {}) : b;

    if (field === "nombre") {
      valA = `${a.captain} ${a.club}`.toLowerCase();
      valB = `${b.captain} ${b.club}`.toLowerCase();
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
    } else if (field.includes(".")) {
      const [cond, subField] = field.split(".");
      valA = a[cond]?.[subField] ?? 0;
      valB = b[cond]?.[subField] ?? 0;
    } else {
      valA = srcA?.[field] ?? 0;
      valB = srcB?.[field] ?? 0;
    }

    return dir === "asc" ? valA - valB : valB - valA;
  });
};

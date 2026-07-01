export const MIN_RACHA = 3;

export const getOutcome = (m) => {
  // 👈 CAMBIO: usamos el campo "final" del partido que es la fuente de verdad
  // en lugar de calcular desde golFavor/golContra (que puede no coincidir con autogoles, etc.)
  const final = String(m?.final || "")
    .toLowerCase()
    .trim();
  if (final === "ganado") return "g";
  if (final === "perdido") return "p";
  if (final === "empatado") return "e";
  // fallback por si "final" viene vacío
  const gf = Number(m?.golFavor || 0);
  const gc = Number(m?.golContra || 0);
  return gf > gc ? "g" : gf < gc ? "p" : "e";
};

export const matchesTipo = (m, tipo) => {
  const r = getOutcome(m);
  if (tipo === "invictos") return r === "g" || r === "e";
  if (tipo === "ganados") return r === "g";
  if (tipo === "empatados") return r === "e";
  if (tipo === "perdidos") return r === "p";
  return false;
};

// Devuelve la racha más larga que cumpla MIN_RACHA, o null
export const findBestStreak = (matches, tipo) => {
  let best = null;
  let cur = [];
  for (const m of matches) {
    if (matchesTipo(m, tipo)) {
      cur.push(m);
    } else {
      if (cur.length >= MIN_RACHA && (!best || cur.length > best.length))
        best = [...cur];
      cur = [];
    }
  }
  if (cur.length >= MIN_RACHA && (!best || cur.length > best.length))
    best = [...cur];
  return best;
};

export const matchCondicion = (m, condKey) => {
  if (!condKey) return true;
  const c = String(m?.condition || "")
    .toLowerCase()
    .trim();
  return condKey === "neutro"
    ? c === "neutro" || c === "neutral"
    : c === condKey;
};

const COND_KEYS = {
  General: null,
  Local: "local",
  Visitante: "visitante",
  Neutral: "neutro",
};

export const buildStreaks = (allMatches) => {
  if (!Array.isArray(allMatches) || !allMatches.length) return {};

  // Agrupar por capitán+club y ordenar por fecha
  const groups = new Map();
  for (const m of allMatches) {
    const captain = (m?.captain || "").trim();
    const club = (m?.club || "").trim();
    if (!captain || !club) continue;
    const key = `${captain}__${club}`;
    if (!groups.has(key)) groups.set(key, { captain, club, matches: [] });
    groups.get(key).matches.push(m);
  }

  for (const [, g] of groups) {
    g.matches.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const years = g.matches
      .map((m) => (m.fecha ? new Date(m.fecha).getFullYear() : null))
      .filter(Boolean);
    if (years.length) {
      const min = Math.min(...years);
      const max = Math.max(...years);
      g.yearRange = min === max ? String(min) : `${min} - ${max}`;
    } else {
      g.yearRange = "—";
    }
  }

  const TIPOS = ["invictos", "ganados", "empatados", "perdidos"];
  const CONDS = ["General", "Local", "Visitante", "Neutral"];
  const result = {};

  for (const tipo of TIPOS) {
    result[tipo] = {};
    for (const cond of CONDS) {
      result[tipo][cond] = [];
      const condKey = COND_KEYS[cond];

      for (const [, g] of groups) {
        const filtered = g.matches.filter((m) => matchCondicion(m, condKey));
        const streak = findBestStreak(filtered, tipo);
        if (!streak) continue;

        const gf = streak.reduce((s, m) => s + Number(m.golFavor || 0), 0);
        const gc = streak.reduce((s, m) => s + Number(m.golContra || 0), 0);
        const gs = streak.filter((m) => getOutcome(m) === "g").length;
        const es = streak.filter((m) => getOutcome(m) === "e").length;
        const ps = streak.filter((m) => getOutcome(m) === "p").length;

        const fechas = streak
          .map((m) => m.fecha)
          .filter(Boolean)
          .sort();

        result[tipo][cond].push({
          captain: g.captain,
          club: g.club,
          yearRange: g.yearRange,
          racha: streak.length,
          g: gs,
          e: es,
          p: ps,
          gf,
          gc,
          fechaInicio: fechas[0] || null,
          fechaFin: fechas[fechas.length - 1] || null,
        });
      }
    }
  }

  return result;
};

export const fmtFecha = (f) => {
  if (!f) return "—";
  const d = new Date(f);
  if (isNaN(d)) return f;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export const sortList = (list, field, dir) =>
  [...list].sort((a, b) => {
    if (field === "captain") {
      const va = `${a.captain} ${a.club}`.toLowerCase();
      const vb = `${b.captain} ${b.club}`.toLowerCase();
      return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    const va = a[field] ?? 0;
    const vb = b[field] ?? 0;
    return dir === "asc" ? va - vb : vb - va;
  });

export const TIPO_CFG = {
  invictos: {
    label: "Invictos",
    border: "border-sky-300",
    bg: "bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
    racha: "text-sky-600",
  },
  ganados: {
    label: "Ganados",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    racha: "text-emerald-600",
  },
  empatados: {
    label: "Empatados",
    border: "border-amber-300",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    racha: "text-amber-600",
  },
  perdidos: {
    label: "Perdidos",
    border: "border-rose-300",
    bg: "bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
    racha: "text-rose-600",
  },
};

export const COND_CFG = {
  General: "border-sky-500",
  Local: "border-emerald-500",
  Visitante: "border-indigo-500",
  Neutral: "border-amber-500",
};

export const SORT_OPTS = [
  { key: "captain", label: "🧤 Nombre" },
  { key: "racha", label: "Racha" },
  { key: "g", label: "G" },
  { key: "e", label: "E" },
  { key: "p", label: "P" },
];

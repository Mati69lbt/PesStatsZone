import { normalizeName } from "../../../../utils/normalizeName";
import { prettySafe } from "../../campeonatos/util/funtions";

export const formatDate = (iso) => {
  if (!iso) return "—";
  // iso esperado: "YYYY-MM-DD"
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const getOutcome = (m) => {
  // priorizamos el campo "final" si lo tenés
  const fin = String(m?.final ?? "").toLowerCase();
  if (fin.includes("gan")) return "GANADO";
  if (fin.includes("perd")) return "PERDIDO";
  if (fin.includes("emp")) return "EMPATADO";

  const gf = Number(m?.golFavor ?? 0);
  const gc = Number(m?.golContra ?? 0);
  if (gf > gc) return "GANADO";
  if (gf < gc) return "PERDIDO";
  return "EMPATADO";
};

export const badgeClass = (outcome) => {
  // sin colores fijos agresivos, pero con diferencia visual
  if (outcome === "GANADO")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (outcome === "PERDIDO") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

export const prettyCondition = (c) => {
  const s = String(c ?? "").toLowerCase();
  if (s.includes("loc")) return "Local";
  if (s.includes("vis")) return "Visitante";
  return prettySafe(c);
};

export const joinScorers = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return "—";

  // Formato viejo: array de strings
  if (typeof arr[0] === "string") {
    const clean = arr.map((s) => String(s).trim()).filter(Boolean);
    return clean.length ? clean.join(" · ") : "—";
  }

  // Formato nuevo: array de objetos
  const clean = arr
    .map((g) => {
      const name = String(g?.name ?? "").trim();
      if (!name) return null;

      // cantidad de goles (si hay flags)
      let n = 1;
      if (g?.doblete) n = 2;
      if (g?.hattrick || g?.triplete) n = 3;

      // si en algún momento te llega un número real, lo usamos
      if (Number.isFinite(g?.goles)) n = g.goles;
      if (Number.isFinite(g?.goals)) n = g.goals;

      const suffix = n >= 2 ? ` (${n})` : "";

      // autogol
      const own = g?.isOwnGoal ? " En Contra" : "";

      return `${name}${suffix}${own}`;
    })
    .filter(Boolean);

  return clean.length ? clean.join(" · ") : "—";
};

export const numColor = (n) => {
  const v = Number(n ?? 0);
  if (v > 0) return "text-emerald-700";
  if (v < 0) return "text-rose-700";
  return "text-slate-700";
};

export const pillBg = (n) => {
  const v = Number(n ?? 0);
  if (v > 0) return "bg-emerald-50 border-emerald-200";
  if (v < 0) return "bg-rose-50 border-rose-200";
  return "bg-slate-50 border-slate-200";
};

export const getTorneoDisplay = (match, torneosConfig) => {
  const name = String(match?.torneoName || "").trim();
  const display = String(match?.torneoDisplay || "").trim();
  const fecha = match?.fecha;

  const baseName = name || display || "—";

  const formato =
    torneosConfig?.[baseName]?.formato || torneosConfig?.[name]?.formato;

  // Si no es europeo, respetamos display o fallback clásico
  if (formato !== "europeo") {
    if (display) return display;

    const year = Number(match?.torneoYear);
    if (Number.isFinite(year)) return `${baseName} ${year}`;

    return baseName;
  }

  // --- FORMATO EUROPEO REAL (01/07 - 30/06) ---
  if (!fecha) return baseName;

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return baseName;

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  let startYear;

  if (month >= 7) {
    // julio-diciembre
    startYear = year;
  } else {
    // enero-junio
    startYear = year - 1;
  }

  return `${baseName} ${startYear} - ${startYear + 1}`;
};

export const getScoreDisplay = (m) => {
  const gf = Number(m?.golFavor ?? 0);
  const gc = Number(m?.golContra ?? 0);

  const cond = String(m?.condition ?? "").toLowerCase();

  if (cond.includes("vis")) {
    // visitante: rival - nosotros (GC - GF)
    return { left: gc, right: gf };
  }

  // local o neutro: nosotros - rival (GF - GC)
  return { left: gf, right: gc };
};

export const cardBorderClass = (m) => {
  const o = getOutcome(m); // "GANADO" | "EMPATADO" | "PERDIDO"

  if (o === "GANADO") return "border-emerald-400";
  if (o === "PERDIDO") return "border-red-400";
  return "border-amber-400";
};

// ------------------------------
// Goleadores (helpers para tabla)
// ------------------------------

// Mantengo tu regla de conteo por flags:
// - triplete/hattrick = 3
// - triplete + gol = 4
// - dob + triplete = 5
// - dob + triplete + gol = 6
// - doblete = 2
// - gol = 1
export const golesDeItem = (g) => {
  if (!g) return 0;

  // Formato nuevo: objeto con flags
  if (typeof g === "object") {
    const t = !!(g.triplete || g.hattrick);
    if (t && g.doblete && g.gol) return 6;
    if (t && g.doblete) return 5;
    if (t && g.gol) return 4;
    if (t) return 3;
    if (g.doblete) return 2;
    if (g.gol) return 1;
    return 0;
  }

  // Formato viejo: string
  const s = String(g).trim();
  const m = s.match(/\((\d+)\)/); // "Perez (3)"
  if (m) return Number(m[1]) || 1;
  return s ? 1 : 0;
};

export const nombreDeItem = (g) => {
  if (!g) return "";
  if (typeof g === "object") return String(g.name ?? "").trim();
  return String(g).trim();
};

// (opcional) ranking simple [{name, goals}]
export const buildRanking = (matches, getter) => {
  const map = new Map();

  (matches ?? []).forEach((m) => {
    const arr = getter(m);
    if (!Array.isArray(arr)) return;

    arr.forEach((it) => {
      const name = nombreDeItem(it);
      if (!name) return;

      const key = name.toLowerCase();
      const goles = golesDeItem(it);

      map.set(key, {
        name,
        goals: (map.get(key)?.goals ?? 0) + goles,
      });
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => b.goals - a.goals || a.name.localeCompare(b.name)
  );
};

export const getPlayedPlayers = (m) => {  
  const starters = Array.isArray(m?.starters) ? m.starters : [];
  const subs = Array.isArray(m?.subs) ? m.subs : []; 

  
  const toName = (x) => {
    if (!x) return "";
    if (typeof x === "string") return x;
    if (typeof x === "object") return String(x?.name ?? x?.player ?? "").trim();
    return String(x).trim();
  };

  const played = [...starters, ...subs].map(toName).filter(Boolean); 
  return Array.from(new Set(played.map((n) => normalizeName(n))));
};
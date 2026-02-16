import { prettySafe, temporadaKey } from "./funtions";

export const RESULT_OPTIONS = [
  { value: "", label: "Sin definir" },
  { value: "campeon", label: "Campeón" },
  { value: "subcampeon", label: "Sub Campeón" },
  { value: "3ro", label: "Tercero" },
  { value: "4to", label: "Cuarto" },
  { value: "5to", label: "Quinto" },
  { value: "6to", label: "Sexto" },
  { value: "7mo", label: "Séptimo" },
  { value: "8vo", label: "Octavo" },
  { value: "9no", label: "Noveno" },
  { value: "10mo", label: "Décimo" },
  { value: "lejos", label: "Lejos" },
  { value: "fase de grupos", label: "Fase de Grupos" },
  { value: "16 avos de final", label: "16 avos de Final" },
  { value: "32 avos de final", label: "32 avos de Final" },
  { value: "octavos de final", label: "Octavos de Final" },
  { value: "cuartos de final", label: "Cuartos de Final" },
  { value: "semi Final", label: "Semi Final" },
];

export const formatDDMM = (m) => {
  const raw = m?.fecha || m?.createdAt;
  if (!raw) return "—";

  const d =
    typeof raw === "string" ? new Date(`${raw}T00:00:00`) : new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};

// Colores para el resultado del PARTIDO
export const getResultadoPartidoClasses = (final) => {
  switch (final) {
    case "ganado":
      return "bg-emerald-100 text-emerald-800 font-semibold";
    case "empatado":
      return "bg-amber-100 text-amber-800 font-semibold";
    case "perdido":
      return "bg-rose-100 text-rose-800 font-semibold";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const cleanToken = (v) => String(v ?? "").trim();
const isOG = (g) =>
  g?.isOwnGoal === true || cleanToken(g?.name).toLowerCase() === "__og__";
const prettyScorerName = (g) => (isOG(g) ? "En contra" : prettySafe(g?.name));

export const calcularGolesGoleador = (g) => {
  if (!g) return 0;
  if (g.triplete || g.hattrick) return 3;
  if (g.doblete) return 2;
  if (g.gol) return 1;
  return 0;
};

export const getGoleadoresPropiosTexto = (match) => {
  const lista = Array.isArray(match.goleadoresActiveClub)
    ? match.goleadoresActiveClub
    : [];

  const items = lista
    .map((g) => {
      const goles = calcularGolesGoleador(g);
      if (!g.name || goles <= 0) return null;
      return goles === 1
        ? `${prettyScorerName(g)}`
        : `${prettyScorerName(g)} (${goles})`;
    })
    .filter(Boolean);

  return items.length ? items.join(", ") : "—";
};

export const getGoleadoresRivalesTexto = (match) => {
  const lista = Array.isArray(match.goleadoresRivales)
    ? match.goleadoresRivales
    : [];

  const items = lista
    .map((g) => {
      const goles = calcularGolesGoleador(g);
      if (!g.name || goles <= 0) return null;
      return goles === 1
        ? `${prettyScorerName(g)}`
        : `${prettyScorerName(g)} (${goles})`;
    })
    .filter(Boolean);

  return items.length ? items.join(", ") : "—";
};

export const normKey = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

// ✅ OJO: acá lo dejamos “puro” (no depende de variables del componente)
export const splitCampFromMatch = (m, torneosConfig = {}) => {
  const rawName =
    m?.torneoName || m?.torneo || m?.torneoDisplay || "Sin torneo";

  const label = temporadaKey({
    torneoName: rawName,
    torneoYear: m?.torneoYear,
    fecha: m?.fecha || m?.createdAt,
    torneosConfig,
  });

  const rx = /\b(19|20)\d{2}(?:\s*[-–]\s*(19|20)\d{2})?\b$/;
  const mm = String(label).match(rx);

  const season = mm ? mm[0].replace(/\s+/g, "") : null;
  const base = season
    ? String(label).replace(mm[0], "").trim()
    : String(label).trim();

  return { base, season };
};

export const getYearFromCamp = (camp) => {
  // ✅ si ya viene calculado como "2022-2023", usarlo
  if (camp?.year) return camp.year;

  if (!camp || !Array.isArray(camp.matches) || !camp.matches.length)
    return null;

  const years = Array.from(
    new Set(
      camp.matches
        .map((m) => m.torneoYear)
        .filter((y) => y !== undefined && y !== null),
    ),
  );

  return years.length ? years[0] : null;
};


export const getColorSegunResultado = (stats = {}) => {
  const { g = 0, e = 0, p = 0 } = stats;
  if (g >= e && g > p) return "bg-green-100";
  if (p > g && p >= e) return "bg-red-100";
  if (g === p && g > e) return "bg-yellow-100";
  if (g === e && g === p) return "bg-yellow-100";
  if (e >= g && e >= p) return "bg-yellow-100";
  return "bg-pink-100";
};

export const formatearResumen = ({
  pj = 0,
  g = 0,
  e = 0,
  p = 0,
  gf = 0,
  gc = 0,
} = {}) =>
  pj === 0
    ? ""
    : `🏆 ${g}Ga - ❌ ${p}Pe
📊 ${pj}PJ - 🤝 ${e}Em
😄 ${gf}GF - 😢 ${gc}GC`;


export const displayNoMinus = (v) => {
  // si viene number => abs
  if (typeof v === "number" && Number.isFinite(v)) return Math.abs(v);

  // si viene string "-3" => "3"
  if (typeof v === "string") {
    const s = v.trim();
    // intenta convertir a número
    const n = Number(s.replace(",", "."));
    if (!Number.isNaN(n) && s !== "") return Math.abs(n);
    // fallback simple por si viene "-2" con texto raro
    return s.startsWith("-") ? s.slice(1) : s;
  }

  return v;
};

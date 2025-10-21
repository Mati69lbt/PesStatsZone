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

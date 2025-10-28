import { pretty } from "../../match/utils/pretty";

// cspell: ignore Segun Yefectividad anio
export const prettySafe = (s) =>
  typeof s === "string" && s.trim() ? pretty(s) : String(s ?? "");

export function isLigaOCampeonato(name = "") {
  const n = (name || "").toLowerCase();
  return n.includes("liga") || n.includes("campeonato");
}

export function temporadaKey({ torneoName, torneoYear, fecha }) {
  // Si es liga/campeonato => temporada julio-junio, si no => año simple
  if (isLigaOCampeonato(torneoName)) {
    const f = fecha ? new Date(fecha) : null;
    const anio = f ? f.getFullYear() : Number(torneoYear) || 0;
    if (!f) return `${torneoName} ${anio}`; // fallback
    const mes = f.getMonth() + 1;
    const temp = mes >= 7 ? `${anio}-${anio + 1}` : `${anio - 1}-${anio}`;
    return `${torneoName} ${temp}`;
  }
  // copas u otros torneos dentro del mismo año
  const anio =
    Number(torneoYear) || (fecha ? new Date(fecha).getFullYear() : "");
  return `${torneoName} ${anio}`;
}

export function sumInit() {
  return { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 };
}

export function applyMatch(res, { esLocal, gf, gc }) {
  const r = gf > gc ? "g" : gf < gc ? "p" : "e";
  res.pj += 1;
  res[r] += 1;
  res.gf += gf;
  res.gc += gc;
}

export function getColorSegunResultado(stats) {
  const { g = 0, e = 0, p = 0 } = stats || {};
  if (g >= e && g > p) return "bg-green-100";
  if (p > g && p >= e) return "bg-red-100";
  if (e >= g && e >= p) return "bg-yellow-100";
  return "bg-pink-100";
}

export function getDG({ gf = 0, gc = 0 }) {
  return (gf || 0) - (gc || 0);
}

export function puntosYefectividad(box) {
  const puntos = box.g * 3 + box.e;
  const posibles = box.pj * 3;
  const efectividad = posibles > 0 ? (puntos / posibles).toFixed(2) : "0.00";
  return { puntos, efectividad };
}

import { pretty } from "../../match/utils/pretty";
import Notiflix from "notiflix";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../configuration/firebase";

// cspell: ignore Segun Yefectividad anio
export const prettySafe = (s) =>
  typeof s === "string" && s.trim() ? pretty(s) : String(s ?? "");

export function isLigaOCampeonato(name = "") {
  const n = (name || "").toLowerCase();
  return n.includes("liga") || n.includes("campeonato");
}

const stripYears = (name = "") =>
  name
    .toString()
    .replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, "") // 2022-2023
    .replace(/\b(19|20)\d{2}\b/g, "") // 2022
    .replace(/\s{2,}/g, " ")
    .trim();

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
  for (const [k, v] of Object.entries(torneosConfig || {})) {
    if (norm(stripYears(k)) === target) {
      const f = (v?.formato ?? "").toString().trim().toLowerCase();
      return f === "europeo" ? "europeo" : "anual"; // "" o undefined => anual
    }
  }
  return "anual";
};

export function temporadaKey({ torneoName, torneoYear, fecha, torneosConfig }) {

  const nombre = stripYears(torneoName || "").trim() || "Sin torneo";

  const formato = getFormato(torneosConfig, nombre);

  const d = fecha
    ? typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ? new Date(`${fecha}T00:00:00`) // ✅ local midnight
      : new Date(fecha)
    : null;

  const y = Number(torneoYear) || (d && d.getFullYear()) || 0;

  if (formato === "europeo") {
    if (d && Number.isFinite(d.getTime())) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const startYear = month >= 7 ? year : year - 1;
      return `${nombre} ${startYear}-${startYear + 1}`; // ✅ 2022-2023
    }
    // fallback si no hay fecha pero hay torneoYear
    if (y) return `${nombre} ${y - 1}-${y}`;
    return `${nombre}`;
  }

  // anual
  if (y) return `${nombre} ${y}`; // ✅ Liga Aguila 1 2022
  if (d && Number.isFinite(d.getTime())) return `${nombre} ${d.getFullYear()}`;
  return `${nombre}`;
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
  const efectividad =
    posibles > 0 ? Math.round((puntos / posibles) * 100) : "0.00";
  return { puntos, efectividad, posibles };
}

export function borrarPartido({ match, uid, clubKey, onDone }) {
  if (!match?.id) {
    Notiflix.Notify.failure("No se encontró el ID del partido.");
    return;
  }

  Notiflix.Confirm.show(
    "Borrar Partido",
    `¿Estás seguro de borrar el partido de ${match.condition} vs ${prettySafe(
      match.rival || "",
    )}?`,
    "Sí",
    "No",
    async () => {
      try {
        const userRef = doc(db, "users", uid);

        const snap = await getDoc(userRef);
        const data = snap.data() || {};

        const key = clubKey || match.club;
        const current = data?.lineups?.[key]?.matches || [];
        const next = current.filter((m) => m?.id !== match.id);

        await updateDoc(userRef, {
          [`lineups.${key}.matches`]: next,
        });

        Notiflix.Notify.success("Partido borrado con éxito.");

        // ✅ acá avisamos al componente que ya se borró
        if (typeof onDone === "function") {
          onDone();
        }
      } catch (e) {
        console.error(e);
        Notiflix.Notify.failure("No se pudo borrar el partido.");
      }
    },
    () => Notiflix.Notify.info("El partido no se borró"),
  );
}

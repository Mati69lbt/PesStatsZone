import { normalizeName } from "../../../../utils/normalizeName";

export const pretty = (value) => {
  if (value === null || value === undefined) return "";

  // Aseguramos string: si es array, lo unimos; si no, casteamos.
  let str = Array.isArray(value) ? value.join(" ") : String(value);
  str = str.trim();
  if (!str) return "";

  // Partimos por espacios (múltiples espacios, tabs, etc.)
  const parts = str.split(/\s+/);

  const words = parts
    .map((p) => {
      // Limpiamos la palabra (minúsculas y sin tildes)
      const base = normalizeName(p);
      if (!base) return "";

      // LÓGICA DE MAYÚSCULAS:
      // 1. Quitamos puntos temporales para contar la longitud real (ej: "f.c." -> "fc")
      const cleanLength = base.replace(/\./g, "").length;

      // 2. Si tiene 2 o 3 letras (ej: rb, psg, fc, tsg, vfl), todo a mayúsculas
      if (cleanLength >= 2 && cleanLength <= 3) {
        return base.toUpperCase();
      }

      // 3. Caso especial: si es una sola letra con punto (ej: "f. c.") o palabra larga
      // Capitalizamos la primera letra y el resto queda como viene
      return base.charAt(0).toUpperCase() + base.slice(1);
    })
    .filter(Boolean);

  return words.join(" ");
};

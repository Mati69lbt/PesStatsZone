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

      const cleanWord = base.replace(/\./g, ""); // "f.c." -> "fc"
      const cleanLength = cleanWord.length;

      // Identificamos si tiene vocales (a, e, i, o, u)
      const tieneVocales = /[aeiou]/i.test(cleanWord);

      // 2. Regla: 2 o 3 letras Y que NO tenga vocales (solo consonantes como PSG, FC, RB)
      if (cleanLength >= 2 && cleanLength <= 3 && !tieneVocales) {
        return base.toUpperCase();
      }

      // 3. Si es una palabra corta con vocales (de, la, el) o palabra larga,
      // solo capitalizamos la primera letra.
      return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
    })
    .filter(Boolean);

  return words.join(" ");
};

import { normalizeName } from "../../../../utils/normalizeName";

export const pretty = (value) => {
  if (value === null || value === undefined) return "";

  // Aseguramos string: si es array, lo unimos; si no, casteamos.
  let str = Array.isArray(value) ? value.join(" ") : String(value);
  str = str.trim();
  if (!str) return "";

  // Partimos por espacios (múltiples espacios, tabs, etc.)
  const parts = str.split(/\s+/);

  // Normalizamos a minúscula sin tildes y capitalizamos la primera letra
  const words = parts
    .map((p) => {
      const base = normalizeName(p); // minúsculas, sin diacríticos
      if (!base) return "";
      return base.charAt(0).toUpperCase() + base.slice(1);
    })
    .filter(Boolean);

  return words.join(" ");
};

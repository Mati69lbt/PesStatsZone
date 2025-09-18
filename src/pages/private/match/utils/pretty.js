import { normalizeName } from "../../../../utils/normalizeName";

export const pretty = (name) => {
  if (!name) return "";
  const nombre = name.split(" ");
  const palabras = nombre.map(
    (palabra) =>
      palabra.charAt(0).toUpperCase() + normalizeName(palabra).slice(1)
  );
  const resultado = palabras.join(" ");
  return resultado;
};

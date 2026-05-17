// Formateador de fecha sutil (YYYY-MM-DD a DD/MM/AAAA)
export const formatearFecha = (f) => {
  if (!f) return "-";
  const partes = f.split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return f;
};

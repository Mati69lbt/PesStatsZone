// Formateador de fecha sutil (YYYY-MM-DD a DD/MM/AAAA)
export const formatearFecha = (f) => {
  if (!f) return "-";
  const partes = f.split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return f;
};

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const descomponerFecha = (f) => {
  if (!f) return { dia: "--", mes: "---", anio: "----" };
  const partes = f.split("-"); // [YYYY, MM, DD]

  if (partes.length === 3) {
    const idxMes = parseInt(partes[1], 10) - 1;
    return {
      dia: partes[2].padStart(2, "0"),
      mes: MESES[idxMes] || "---",
      anio: partes[0],
    };
  }
  return { dia: f, mes: "", anio: "" };
};

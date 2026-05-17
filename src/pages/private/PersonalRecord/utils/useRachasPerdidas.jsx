// useRachasPerdidas.jsx
import { useMemo } from "react";
import { pretty } from "../../match/utils/pretty"; // Ajustá la ruta según tu estructura

export const useRachasPerdidas = (lineups = {}) => {
  return useMemo(() => {
    const resultado = [];

    Object.keys(lineups).forEach((clubKey) => {
      const clubData = lineups[clubKey];
      const matches = Array.isArray(clubData?.matches) ? clubData.matches : [];

      if (matches.length === 0) return;

      // 1. Ordenamos cronológicamente por fecha
      const partidosOrdenados = [...matches].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha),
      );

      let rachaActual = 0;
      let fechaInicioActual = "";

      const registrarRachaSiAplica = (fechaFin) => {
        if (rachaActual >= 5) {
          resultado.push({
            club: clubData.label || pretty(clubKey),
            rachaDerrotas: rachaActual,
            fechaInicio: fechaInicioActual,
            fechaFin: fechaFin,
          });
        }
      };

      // 2. Evaluamos exclusivamente derrotas seguidas
      partidosOrdenados.forEach((partido, index) => {
        const resultadoFinal = partido?.final?.toLowerCase()?.trim();

        if (resultadoFinal === "perdido") {
          if (rachaActual === 0) {
            fechaInicioActual = partido.fecha;
          }
          rachaActual++;

          if (index === partidosOrdenados.length - 1) {
            registrarRachaSiAplica(partido.fecha);
          }
        } else {
          // Ganar o empatar corta la racha de derrotas
          if (rachaActual >= 3 && index > 0) {
            const partidoAnterior = partidosOrdenados[index - 1];
            registrarRachaSiAplica(partidoAnterior.fecha);
          }
          rachaActual = 0;
          fechaInicioActual = "";
        }
      });
    });

    // Ordenamos de mayor a menor cantidad de derrotas consecutivas
    return resultado.sort((a, b) => b.rachaDerrotas - a.rachaDerrotas);
  }, [lineups]);
};

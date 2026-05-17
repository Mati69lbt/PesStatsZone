// useRachasGanadas.jsx
import { useMemo } from "react";
import { pretty } from "../../match/utils/pretty";


export const useRachasGanadas = (lineups = {}) => {
  return useMemo(() => {
    const resultado = [];

    Object.keys(lineups).forEach((clubKey) => {
      const clubData = lineups[clubKey];
      const matches = Array.isArray(clubData?.matches) ? clubData.matches : [];

      if (matches.length === 0) return;

      // 1. Ordenamos cronológicamente por fecha de manera ascendente
      const partidosOrdenados = [...matches].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha),
      );

      let rachaActual = 0;
      let fechaInicioActual = "";

      const registrarRachaSiAplica = (fechaFin) => {
        if (rachaActual >= 5) {
          resultado.push({
            club: clubData.label || pretty(clubKey),
            partidosTotales: matches.length,
            rachaVictorias: rachaActual,
            fechaInicio: fechaInicioActual,
            fechaFin: fechaFin,
          });
        }
      };

      // 2. Recorremos los partidos evaluando exclusivamente victorias consecutivas
      partidosOrdenados.forEach((partido, index) => {
        const resultadoFinal = partido?.final?.toLowerCase()?.trim();

        if (resultadoFinal === "ganado") {
          if (rachaActual === 0) {
            fechaInicioActual = partido.fecha;
          }
          rachaActual++;

          // Si es el último partido del array y venía ganando, guardamos la racha acumulada
          if (index === partidosOrdenados.length - 1) {
            registrarRachaSiAplica(partido.fecha);
          }
        } else {
          // Tanto un "empatado" como un "perdido" CORTAN la racha de victorias seguidas
          if (rachaActual >= 5 && index > 0) {
            const partidoAnterior = partidosOrdenados[index - 1];
            registrarRachaSiAplica(partidoAnterior.fecha);
          }

          // Reseteamos contadores para la próxima racha
          rachaActual = 0;
          fechaInicioActual = "";
        }
      });
    });

    // Ordenamos de mayor a menor cantidad de victorias consecutivas
    return resultado.sort((a, b) => b.rachaVictorias - a.rachaVictorias);
  }, [lineups]);
};

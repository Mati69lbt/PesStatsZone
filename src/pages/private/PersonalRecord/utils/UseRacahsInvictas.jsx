// UseRacahsInvictas.jsx
import { useMemo } from "react";
import { pretty } from "../../match/utils/pretty"; // Ajusta esta ruta si es necesario

export const useRachasInvictas = (lineups = {}) => {
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
      let ganadosActual = 0;
      let empatadosActual = 0;
      let fechaInicioActual = "";

      // Función auxiliar para registrar la racha si cumple el mínimo de 5 partidos
      const registrarRachaSiAplica = (fechaFin) => {
        if (rachaActual >= 5) {
          resultado.push({
            club: clubData.label || pretty(clubKey),
            partidosTotales: matches.length,
            rachaInvicta: rachaActual,
            ganados: ganadosActual,
            empatados: empatadosActual,
            fechaInicio: fechaInicioActual,
            fechaFin: fechaFin,
          });
        }
      };

      // 2. Recorremos los partidos evaluando las rachas
      partidosOrdenados.forEach((partido, index) => {
        const resultadoFinal = partido?.final?.toLowerCase()?.trim();

        if (resultadoFinal === "ganado" || resultadoFinal === "empatado") {
          if (rachaActual === 0) {
            fechaInicioActual = partido.fecha;
          }

          rachaActual++;
          if (resultadoFinal === "ganado") {
            ganadosActual++;
          } else {
            empatadosActual++;
          }

          // Si es el último partido del array y venía invicto, guardamos la racha acumulada
          if (index === partidosOrdenados.length - 1) {
            registrarRachaSiAplica(partido.fecha);
          }
        } else if (resultadoFinal === "perdido") {
          // Si venía de una racha invicta de al menos 5 partidos, la registramos antes de resetear contadores
          // La racha terminó en el partido anterior, por lo que usamos la fecha del partido anterior
          if (rachaActual >= 5 && index > 0) {
            const partidoAnterior = partidosOrdenados[index - 1];
            registrarRachaSiAplica(partidoAnterior.fecha);
          }

          // Reseteamos contadores para la siguiente posible racha
          rachaActual = 0;
          ganadosActual = 0;
          empatadosActual = 0;
          fechaInicioActual = "";
        }
      });
    });

    // Ordenamos todas las grandes rachas de mayor cantidad de partidos invictos a menor
    return resultado.sort((a, b) => b.rachaInvicta - a.rachaInvicta);
  }, [lineups]);
};

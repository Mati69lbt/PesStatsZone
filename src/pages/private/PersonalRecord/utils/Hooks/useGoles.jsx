// useGoles.jsx
import { useMemo } from "react";
import { pretty } from "../../../match/utils/pretty";

export const useGoles = (lineups = {}, config = {}) => {
  const { condition } = config;

  return useMemo(() => {
    const anotando = [];
    const recibiendo = [];
    const vallasInvictas = [];
    const sinMarcar = [];

    Object.keys(lineups).forEach((clubKey) => {
      const clubData = lineups[clubKey];
      const matches = Array.isArray(clubData?.matches) ? clubData.matches : [];
      if (matches.length === 0) return;

      // 1. Filtrar por condición (local, visitante, neutral/"neutro")
      let partidosFiltrados = [...matches];
      if (condition) {
        const condClean = condition.toLowerCase().trim();
        partidosFiltrados = partidosFiltrados.filter((m) => {
          const matchCond = m?.condition?.toLowerCase()?.trim();
          // Mapeamos por si viene como "neutral" o "neutro"
          if (condClean === "neutral" || condClean === "neutro") {
            return matchCond === "neutral" || matchCond === "neutro";
          }
          return matchCond === condClean;
        });
      }

      if (partidosFiltrados.length === 0) return;

      // 2. Ordenar cronológicamente (Ascendente)
      const partidosOrdenados = partidosFiltrados.sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha),
      );

      const clubLabel = clubData.label || pretty(clubKey);

      // --- CONTADORES TEMPORALES PARA EL CLUB ACTUAL ---
      // Racha Anotando
      let rA = 0;
      let fIA = "";
      let totalGolesAnotados = 0;

      // Racha Recibiendo
      let rR = 0;
      let fIR = "";
      let totalGolesRecibidos = 0;

      // Racha Valla Invicta
      let rV = 0;
      let fIV = "";

      let rS = 0;
      let fIS = "";

      // --- FUNCIONES AUXILIARES DE REGISTRO ---
      const checkAnotando = (fechaFin) => {
        if (rA >= 10) {
          anotando.push({
            club: clubLabel,
            racha: rA,
            acumulados: totalGolesAnotados, // Goles totales metidos durante la racha
            fechaInicio: fIA,
            fechaFin: fechaFin,
          });
        }
      };

      const checkSinMarcar = (fechaFin) => {
        if (rS >= 3) {
          sinMarcar.push({
            club: clubLabel,
            racha: rS,
            fechaInicio: fIS,
            fechaFin,
          });
        }
      };

      const checkRecibiendo = (fechaFin) => {
        if (rR >= 10) {
          recibiendo.push({
            club: clubLabel,
            racha: rR,
            acumulados: totalGolesRecibidos, // Goles totales encajados durante la racha
            fechaInicio: fIR,
            fechaFin: fechaFin,
          });
        }
      };

      const checkVallaInvicta = (fechaFin) => {
        if (rV >= 3) {
          vallasInvictas.push({
            club: clubLabel,
            racha: rV,
            fechaInicio: fIV,
            fechaFin: fechaFin,
          });
        }
      };

      // 3. Recorremos el historial ordenado evaluando las rachas
      partidosOrdenados.forEach((partido, index) => {
        const gf = Number(partido?.golFavor ?? 0);
        const gc = Number(partido?.golContra ?? 0);
        const esUltimo = index === partidosOrdenados.length - 1;

        // --- LÓGICA DE PARTIDOS SEGUIDOS ANOTANDO ---
        if (gf > 0) {
          if (rA === 0) fIA = partido.fecha;
          rA++;
          totalGolesAnotados += gf;
          if (esUltimo) checkAnotando(partido.fecha);
        } else {
          if (index > 0) checkAnotando(partidosOrdenados[index - 1].fecha);
          rA = 0;
          totalGolesAnotados = 0;
          fIA = "";
        }

        // --- LÓGICA DE PARTIDOS SEGUIDOS RECIBIENDO ---
        if (gc > 0) {
          if (rR === 0) fIR = partido.fecha;
          rR++;
          totalGolesRecibidos += gc;
          if (esUltimo) checkRecibiendo(partido.fecha);
        } else {
          if (index > 0) checkRecibiendo(partidosOrdenados[index - 1].fecha);
          rR = 0;
          totalGolesRecibidos = 0;
          fIR = "";
        }

        // --- LÓGICA DE VALLAS INVICTAS (ARCO EN CERO) ---
        if (gc === 0) {
          if (rV === 0) fIV = partido.fecha;
          rV++;
          if (esUltimo) checkVallaInvicta(partido.fecha);
        } else {
          if (index > 0) checkVallaInvicta(partidosOrdenados[index - 1].fecha);
          rV = 0;
          fIV = "";
        }
        // --- LÓGICA DE PARTIDOS SEGUIDOS SIN MARCAR ---
        if (gf === 0) {
          if (rS === 0) fIS = partido.fecha;
          rS++;
          if (esUltimo) checkSinMarcar(partido.fecha);
        } else {
          if (index > 0) checkSinMarcar(partidosOrdenados[index - 1].fecha);
          rS = 0;
          fIS = "";
        }
      });
    });

    // 4. Ordenamiento de mayor a menor según la cantidad de partidos (racha)
    const ordenarPorRacha = (arr) => arr.sort((a, b) => b.racha - a.racha);

    return {
      anotando: ordenarPorRacha(anotando),
      recibiendo: ordenarPorRacha(recibiendo),
      vallasInvictas: ordenarPorRacha(vallasInvictas),
      sinMarcar: ordenarPorRacha(sinMarcar),
    };
  }, [lineups, condition]);
};

// useRachas.jsx
import { useMemo } from "react";
import { pretty } from "../../../match/utils/pretty";



export const useRachas = (lineups = {}, config = {}) => {
  const { condition } = config;

  return useMemo(() => {
    const ganados = [];
    const empatados = [];
    const perdidos = [];
    const invictos = [];

    Object.keys(lineups).forEach((clubKey) => {
      const clubData = lineups[clubKey];
      const matches = Array.isArray(clubData?.matches) ? clubData.matches : [];
      if (matches.length === 0) return;

      // 1. Filtrar por condición (local, visitante, neutral) si se especificó
      let partidosFiltrados = [...matches];
      if (condition) {
        const condClean = condition.toLowerCase().trim();
        partidosFiltrados = partidosFiltrados.filter(
          (m) => m?.condition?.toLowerCase()?.trim() === condClean,
        );
      }

      if (partidosFiltrados.length === 0) return;

      // 2. Ordenar cronológicamente (Ascendente)
      const partidosOrdenados = partidosFiltrados.sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha),
      );

      const clubLabel = clubData.label || pretty(clubKey);

      // --- Inicializadores de estado para las 4 rachas en paralelo ---
      let rV = 0,
        fIV = ""; // Victorias
      let rE = 0,
        fIE = ""; // Empates
      let rD = 0,
        fID = ""; // Derrotas
      let rI = 0,
        fII = "",
        gI = 0,
        eI = 0; // Invictos

      // Funciones auxiliares internas para registrar al cumplir mínimos (ej: >= 5 victorias/derrotas, >= 2 empates)
      const checkVictoria = (f) => {
        if (rV >= 3)
          ganados.push({
            club: clubLabel,
            rachaVictorias: rV,
            fechaInicio: fIV,
            fechaFin: f,
          });
      };
      const checkEmpate = (f) => {
        if (rE >= 3)
          empatados.push({
            club: clubLabel,
            rachaEmpates: rE,
            fechaInicio: fIE,
            fechaFin: f,
          });
      };
      const checkDerrota = (f) => {
        if (rD >= 3)
          perdidos.push({
            club: clubLabel,
            rachaDerrotas: rD,
            fechaInicio: fID,
            fechaFin: f,
          });
      };
      const checkInvicto = (f) => {
        if (rI >= 5)
          invictos.push({
            club: clubLabel,
            rachaInvicta: rI,
            ganados: gI,
            empatados: eI,
            fechaInicio: fII,
            fechaFin: f,
          });
      };

      // 3. Un solo recorrido lineal (O(N)) por el historial del club
      partidosOrdenados.forEach((partido, index) => {
        const res = partido?.final?.toLowerCase()?.trim();
        const esUltimo = index === partidosOrdenados.length - 1;

        // --- LÓGICA DE VICTORIAS SEGUIDAS ---
        if (res === "ganado") {
          if (rV === 0) fIV = partido.fecha;
          rV++;
          if (esUltimo) checkVictoria(partido.fecha);
        } else {
          if (index > 0) checkVictoria(partidosOrdenados[index - 1].fecha);
          rV = 0;
          fIV = "";
        }

        // --- LÓGICA DE EMPATES SEGUIDOS ---
        if (res === "empatado") {
          if (rE === 0) fIE = partido.fecha;
          rE++;
          if (esUltimo) checkEmpate(partido.fecha);
        } else {
          if (index > 0) checkEmpate(partidosOrdenados[index - 1].fecha);
          rE = 0;
          fIE = "";
        }

        // --- LÓGICA DE DERROTAS SEGUIDAS ---
        if (res === "perdido") {
          if (rD === 0) fID = partido.fecha;
          rD++;
          if (esUltimo) checkDerrota(partido.fecha);
        } else {
          if (index > 0) checkDerrota(partidosOrdenados[index - 1].fecha);
          rD = 0;
          fID = "";
        }

        // --- LÓGICA DE INVICTOS (SIN PERDER) ---
        if (res === "ganado" || res === "empatado") {
          if (rI === 0) fII = partido.fecha;
          rI++;
          if (res === "ganado") gI++;
          else eI++;
          if (esUltimo) checkInvicto(partido.fecha);
        } else {
          if (index > 0) checkInvicto(partidosOrdenados[index - 1].fecha);
          rI = 0;
          gI = 0;
          eI = 0;
          fII = "";
        }
      });
    });

    // 4. Retornamos las listas ya ordenadas de mayor a menor rendimiento
    return {
      ganados: ganados.sort((a, b) => b.rachaVictorias - a.rachaVictorias),
      empatados: empatados.sort((a, b) => b.rachaEmpates - a.rachaEmpates),
      perdidos: perdidos.sort((a, b) => b.rachaDerrotas - a.rachaDerrotas),
      invictos: invictos.sort((a, b) => b.rachaInvicta - a.rachaInvicta),
    };
  }, [lineups, condition]);
};

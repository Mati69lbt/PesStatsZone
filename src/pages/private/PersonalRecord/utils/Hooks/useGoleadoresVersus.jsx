// cspell: ignore Goleadores resumenes
import React, { useMemo } from "react";
import { useLineups } from "../../../../../context/LineUpProvider";

const useGoleadoresVersus = () => {
  const { state: lineupState } = useLineups();
  const lineups = lineupState?.lineups ?? {};

  const allClubKeys = useMemo(() => Object.keys(lineups), [lineups]);

  const matches = useMemo(() => {
    return allClubKeys.flatMap((key) => {
      const bucket = lineups[key];
      const clubName = bucket?.clubName || key;
      const clubMatches = Array.isArray(bucket?.matches) ? bucket.matches : [];
      return clubMatches.map((m) => ({ ...m, clubOrigen: clubName }));
    });
  }, [lineups, allClubKeys]);

 return useMemo(() => {
   // Estructura limpia para acumular de forma independiente por condición
   const acumulador = {
     general: {},
     local: {},
     visitante: {},
     neutral: {},
   };

   matches.forEach((match) => {
     const rival = match.rival?.trim();
     if (!rival) return;

     // Normalizamos la condición del partido
     let condicion = (match.condition || "neutral").toLowerCase();
     if (condicion === "neutral") condicion = "neutral";
     if (condicion === "visitante" || condicion === "visita")
       condicion = "visitante";

     // 1. OBTENER JUGADORES CON PRESENCIA REAL (PJ)
     const convocadosRaw = [
       ...(Array.isArray(match.starters) ? match.starters : []),
       ...(Array.isArray(match.substitutes) ? match.substitutes : []),
     ];
     const convocados = new Set(
       convocadosRaw
         .map((p) => (typeof p === "string" ? p.trim() : p?.name?.trim()))
         .filter(Boolean),
     );

     // 2. OBTENER GOLES MAPEADOS DEL PARTIDO
     const golesPartido = [];
     if (Array.isArray(match.goleadoresActiveClub)) {
       match.goleadoresActiveClub.forEach((g) => {
         const name = g?.name?.trim();
         if (!name) return;

         let cantGoles = 0;
         if (g.gol) cantGoles += 1;
         if (g.doblete) cantGoles += 2;
         if (g.triplete) cantGoles += 3;

         if (cantGoles > 0) {
           golesPartido.push({ name, goles: cantGoles });
         }
       });
     }

     // Creamos un Set con todos los nombres que interactuaron para inicializar las estructuras
     const todosLosJugadores = new Set([
       ...convocados,
       ...golesPartido.map((g) => g.name),
     ]);

     // Definimos qué pestañas se ven afectadas por este partido
     const condicionesAfectadas = ["general", condicion];

     todosLosJugadores.forEach((name) => {
       condicionesAfectadas.forEach((cond) => {
         if (!acumulador[cond]) return; // Resguardo
         if (!acumulador[cond][name]) acumulador[cond][name] = {};
         if (!acumulador[cond][name][rival]) {
           acumulador[cond][name][rival] = {
             name,
             rival,
             club: match.clubOrigen || "Mi Club",
             goles: 0,
             partidos: 0,
           };
         }
       });
     });

     // Sumar 1 Partido Jugado (PJ) a las condiciones correspondientes
     convocados.forEach((name) => {
       condicionesAfectadas.forEach((cond) => {
         if (acumulador[cond]?.[name]?.[rival]) {
           acumulador[cond][name][rival].partidos += 1;
         }
       });
     });

     // Sumar los goles convertidos a las condiciones correspondientes
     golesPartido.forEach((g) => {
       condicionesAfectadas.forEach((cond) => {
         if (acumulador[cond]?.[g.name]?.[rival]) {
           acumulador[cond][g.name][rival].goles += g.goles;
         }
       });
     });
   });

   // Función interna para aplanar el mapa, filtrar por goles >= 3 y calcular promedios reales
   const procesarYOrdenarTabla = (mapaCondicion) => {
     const listaPlana = [];
     Object.keys(mapaCondicion).forEach((jugador) => {
       Object.keys(mapaCondicion[jugador]).forEach((rival) => {
         const item = mapaCondicion[jugador][rival];
         if (item.goles >= 3) {
           const prom =
             item.partidos > 0
               ? (item.goles / item.partidos).toFixed(2)
               : "0.00";
           listaPlana.push({
             ...item,
             promedio: Number(prom),
           });
         }
       });
     });

     // Ordenar: Goles desc, Promedio desc, Partidos asc
     return listaPlana.sort((a, b) => {
       if (b.goles !== a.goles) return b.goles - a.goles;
       if (b.promedio !== a.promedio) return b.promedio - a.promedio;
       return a.partidos - b.partidos;
     });
   };

   return {
     general: procesarYOrdenarTabla(acumulador.general),
     local: procesarYOrdenarTabla(acumulador.local),
     visitante: procesarYOrdenarTabla(acumulador.visitante),
     neutral: procesarYOrdenarTabla(acumulador.neutral),
   };
 }, [matches]);
};

export default useGoleadoresVersus;

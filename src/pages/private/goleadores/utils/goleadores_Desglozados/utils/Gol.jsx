import React, { useMemo, useState } from "react";
import Gol_Tabla from "./Gol_Tabla";

const DEFAULT_ORDEN = { campo: "goles", dir: "desc" };

const Gol = ({ scope, matches }) => {
  const safeMatches = Array.isArray(matches) ? matches : [];

  const [ordenCampo, setOrdenCampo] = useState(DEFAULT_ORDEN.campo);
  const [ordenDireccion, setOrdenDireccion] = useState(DEFAULT_ORDEN.dir);

  const goleadoresOrdenados = useMemo(() => {
    const resumen = {};

    const computeGolesEvento = (g) => {
      if (!g) return 0;
      if (g.dobleHattrick) return 6;
      if (g.manito) return 5;
      if (g.poker) return 4;
      if (g.hattrick || g.triplete) return 3;
      if (g.doblete) return 2;
      if (g.gol) return 1;
      return 0;
    };

    const esOG = (nombre) =>
      !nombre ? false : String(nombre).toLowerCase().includes("__og__");

    safeMatches.forEach((p) => {
      // ámbitos del partido
      let condition = (p?.condition || "").toString().toLowerCase();

      // compat con datos viejos: booleano local
      if (!condition) {
        if (p?.local === true) condition = "local";
        else if (p?.local === false) condition = "visitante";
      }

      const ambitos = ["general"];
      if (condition === "local") ambitos.push("local");
      else if (condition === "visitante") ambitos.push("visitante");
      else if (condition === "neutral" || condition === "neutro")
        ambitos.push("neutro");

      // PJ por partido (starters + substitutes)
      const participantes = [
        ...(Array.isArray(p?.starters) ? p.starters : []),
        ...(Array.isArray(p?.substitutes) ? p.substitutes : []),
      ];

      // Para evitar contar PJ más de una vez por jugador/ámbito en el mismo partido
      const pjPorJugadorEnPartido = {};

      participantes.forEach((raw) => {
        const nombre = raw?.toString().trim();
        if (!nombre || esOG(nombre)) return;

        if (!resumen[nombre]) {
          resumen[nombre] = {
            general: { pj: 0, goles: 0, x2: 0, x3: 0 },
            local: { pj: 0, goles: 0, x2: 0, x3: 0 },
            visitante: { pj: 0, goles: 0, x2: 0, x3: 0 },
            neutro: { pj: 0, goles: 0, x2: 0, x3: 0 },
          };
        }

        if (!pjPorJugadorEnPartido[nombre]) {
          pjPorJugadorEnPartido[nombre] = new Set();
        }

        ambitos.forEach((amb) => pjPorJugadorEnPartido[nombre].add(amb));
      });

      // Goles / x2 / x3 (goleadoresActiveClub)
      const listaRaw = Array.isArray(p?.goleadoresActiveClub)
        ? p.goleadoresActiveClub
        : [];

      listaRaw.forEach((g) => {
        const nombre = (g?.name || g?.nombre || "").toString().trim();
        if (!nombre || esOG(nombre)) return;

        const goles = computeGolesEvento(g);
        if (!goles) return;

        if (!resumen[nombre]) {
          resumen[nombre] = {
            general: { pj: 0, goles: 0, x2: 0, x3: 0 },
            local: { pj: 0, goles: 0, x2: 0, x3: 0 },
            visitante: { pj: 0, goles: 0, x2: 0, x3: 0 },
            neutro: { pj: 0, goles: 0, x2: 0, x3: 0 },
          };
        }

        ambitos.forEach((amb) => {
          resumen[nombre][amb].goles += goles;
          if (goles === 2) resumen[nombre][amb].x2 += 1;
          if (goles === 3) resumen[nombre][amb].x3 += 1;
        });
      });

      // sumar PJ 1 vez por jugador/ámbito en el partido
      Object.entries(pjPorJugadorEnPartido).forEach(([nombre, setAmbitos]) => {
        setAmbitos.forEach((amb) => {
          resumen[nombre][amb].pj += 1;
        });
      });
    });

    const buildAmb = (amb) => {
      const pj = amb.pj || 0;
      const g = amb.goles || 0;
      return {
        ...amb,
        pj,
        goles: g,
        x2: amb.x2 || 0,
        x3: amb.x3 || 0,
        prom: pj > 0 ? g / pj : 0,
      };
    };

    const lista = Object.entries(resumen)
      .map(([nombre, data]) => ({
        nombre,
        general: buildAmb(data.general),
        local: buildAmb(data.local),
        visitante: buildAmb(data.visitante),
        neutro: buildAmb(data.neutro),
      }))
      // ✅ CAMBIO: filtro por el scope actual (antes se filtraba por ordenAmbito)
      .filter((x) => (x?.[scope]?.goles ?? 0) > 0);

    const sorted = lista.sort((a, b) => {
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();

      if (ordenCampo === "nombre") {
        return ordenDireccion === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }

      const valA = a?.[scope]?.[ordenCampo] ?? 0;
      const valB = b?.[scope]?.[ordenCampo] ?? 0;

      const diff = ordenDireccion === "asc" ? valA - valB : valB - valA;
      if (diff !== 0) return diff;

      return nameA.localeCompare(nameB); // desempate
    });

    return sorted;
  }, [safeMatches, scope, ordenCampo, ordenDireccion]);

  if (!safeMatches.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No hay partidos cargados para este club.
      </p>
    );
  }
  return (
    <Gol_Tabla
      ambito={scope} // ✅ CAMBIO: ámbito fijo por tab
      ordenCampo={ordenCampo}
      setOrdenCampo={setOrdenCampo}
      ordenDireccion={ordenDireccion}
      setOrdenDireccion={setOrdenDireccion}
      goleadoresOrdenados={goleadoresOrdenados}
    />
  );
};

export default Gol;

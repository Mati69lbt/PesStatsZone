import React, { useMemo, useState } from "react";
import { prettySafe } from "../../campeonatos/util/funtions";

const GoleadoresGral = ({ matches }) => {
  const safeMatches = Array.isArray(matches) ? matches : [];

  const [ordenAmbito, setOrdenAmbito] = useState("general");
  const [ordenCampo, setOrdenCampo] = useState("goles");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");

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

    safeMatches.forEach((p) => {
      // Determinar ámbitos del partido
      let condition = (p?.condition || "").toString().toLowerCase();

      // Compatibilidad con datos viejos: booleano "local"
      if (!condition) {
        if (p?.local === true) condition = "local";
        else if (p?.local === false) condition = "visitante";
      }

      const ambitos = ["general"];
      if (condition === "local") ambitos.push("local");
      else if (condition === "visitante") ambitos.push("visitante");
      else if (condition === "neutral" || condition === "neutro")
        ambitos.push("neutro");

      const listaRaw = Array.isArray(p?.goleadoresActiveClub)
        ? p.goleadoresActiveClub
        : [];

      // Para evitar contar PJ más de una vez por jugador/ámbito en el mismo partido
      const pjPorJugadorEnPartido = {};

      listaRaw.forEach((g) => {
        const nombre = g?.name?.toString().trim();
        if (!nombre) return;

        // Excluir goles en contra
        if (g.isOwnGoal) return;

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

        if (!pjPorJugadorEnPartido[nombre]) {
          pjPorJugadorEnPartido[nombre] = new Set();
        }

        ambitos.forEach((amb) => {
          const slot = resumen[nombre][amb];

          slot.goles += goles;

          if (g.doblete) slot.x2 += 1;
          if (g.hattrick || g.triplete) slot.x3 += 1;

          pjPorJugadorEnPartido[nombre].add(amb);
        });
      });

      // Sumar PJ una sola vez por jugador/ámbito en este partido
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

    const lista = Object.entries(resumen).map(([nombre, data]) => ({
      nombre,
      general: buildAmb(data.general),
      local: buildAmb(data.local),
      visitante: buildAmb(data.visitante),
      neutro: buildAmb(data.neutro),
    }));

    const sorted = lista.sort((a, b) => {
      if (ordenCampo === "nombre") {
        const valA = a.nombre.toLowerCase();
        const valB = b.nombre.toLowerCase();
        return ordenDireccion === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        const amb = ordenAmbito;
        const valA = a[amb]?.[ordenCampo] ?? 0;
        const valB = b[amb]?.[ordenCampo] ?? 0;
        return ordenDireccion === "asc" ? valA - valB : valB - valA;
      }
    });

    return sorted;
  }, [safeMatches, ordenAmbito, ordenCampo, ordenDireccion]);

  const formatProm = (num) => {
    if (!num || Number.isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  if (!safeMatches.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No hay partidos cargados para este club.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4 text-center">
        👤 Goleadores del equipo
      </h2>

      {/* Controles de orden */}
      <div className="flex flex-wrap gap-4 mb-4 items-end text-sm justify-center">
        <div>
          <label className="text-sm font-medium block">Ámbito</label>
          <select
            value={ordenAmbito}
            onChange={(e) => setOrdenAmbito(e.target.value)}
            className="border p-1 rounded text-sm"
          >
            <option value="general">General</option>
            <option value="local">Local</option>
            <option value="visitante">Visitante</option>
            <option value="neutro">Neutral</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block">Campo</label>
          <select
            value={ordenCampo}
            onChange={(e) => setOrdenCampo(e.target.value)}
            className="border p-1 rounded text-sm"
          >
            <option value="nombre">Nombre</option>
            <option value="pj">PJ</option>
            <option value="goles">Goles</option>
            <option value="x2">⚽x2</option>
            <option value="x3">⚽x3</option>
            <option value="prom">Promedio</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block">Orden</label>
          <select
            value={ordenDireccion}
            onChange={(e) => setOrdenDireccion(e.target.value)}
            className="border p-1 rounded text-sm"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-h-[80vh] overflow-auto ">
        <table className="table-fixed border-collapse mx-auto min-w-[680px] md:min-w-[780px] text-[11px] md:text-sm tabular-nums">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-100 text-slate-700">
              {/* NUEVO: índice */}
              <th
                rowSpan={2}
                className="border px-2 py-2 text-center sticky left-0 bg-slate-100 z-20 w-10"
              >
                #
              </th>

              {/* Jugador (corrida a la derecha por el índice) */}
              <th
                rowSpan={2}
                className="border px-2 py-2 text-left sticky left-10 bg-slate-100 z-20 w-28 sm:w-20 md:w-20 lg:w-20 overflow-hidden"
              >
                Jugador
              </th>

              <th
                colSpan={5}
                className="border px-2 py-2 text-center font-semibold"
              >
                General
              </th>
              <th
                colSpan={5}
                className="border px-2 py-2 text-center font-semibold"
              >
                Local
              </th>
              <th
                colSpan={5}
                className="border px-2 py-2 text-center font-semibold"
              >
                Visitante
              </th>
            </tr>

            <tr className="bg-slate-50 text-slate-600 text-[10px] md:text-xs">
              {["PJ", "G", "⚽x2", "⚽x3", "P"].map((t, i) => (
                <th
                  key={`gen-${i}`}
                  className="border px-2 py-2 w-10 text-center"
                >
                  {t}
                </th>
              ))}
              {["PJ", "G", "⚽x2", "⚽x3", "P"].map((t, i) => (
                <th
                  key={`loc-${i}`}
                  className="border px-2 py-2 w-10 text-center"
                >
                  {t}
                </th>
              ))}
              {["PJ", "G", "⚽x2", "⚽x3", "P"].map((t, i) => (
                <th
                  key={`vis-${i}`}
                  className="border px-2 py-2 w-10 text-center"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {goleadoresOrdenados.map((g, idx) => (
              <tr
                key={g.nombre}
                className="even:bg-slate-50 hover:bg-slate-100/70 transition-colors"
              >
                {/* NUEVO: índice */}
                <td className="border px-2 py-2 text-center sticky left-0 bg-white z-10 w-10">
                  {idx + 1}
                </td>

                {/* Jugador corrido */}
                <td className="border px-2 py-2 text-left font-semibold sticky left-10 bg-white z-10 w-28 sm:w-20 md:w-20 lg:w-20 max-w-[112px] sm:max-w-[128px] md:max-w-[80px] lg:max-w-[160px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {prettySafe(g.nombre)}
                </td>

                {/* General */}
                <td className="border px-2 py-2 text-center">{g.general.pj}</td>
                <td className="border px-2 py-2 text-center">
                  {g.general.goles}
                </td>
                <td className="border px-2 py-2 text-center">{g.general.x2}</td>
                <td className="border px-2 py-2 text-center">{g.general.x3}</td>
                <td className="border px-2 py-2 text-center">
                  {formatProm(g.general.prom)}
                </td>

                {/* Local */}
                <td className="border px-2 py-2 text-center">{g.local.pj}</td>
                <td className="border px-2 py-2 text-center">
                  {g.local.goles}
                </td>
                <td className="border px-2 py-2 text-center">{g.local.x2}</td>
                <td className="border px-2 py-2 text-center">{g.local.x3}</td>
                <td className="border px-2 py-2 text-center">
                  {formatProm(g.local.prom)}
                </td>

                {/* Visitante */}
                <td className="border px-2 py-2 text-center">
                  {g.visitante.pj}
                </td>
                <td className="border px-2 py-2 text-center">
                  {g.visitante.goles}
                </td>
                <td className="border px-2 py-2 text-center">
                  {g.visitante.x2}
                </td>
                <td className="border px-2 py-2 text-center">
                  {g.visitante.x3}
                </td>
                <td className="border px-2 py-2 text-center">
                  {formatProm(g.visitante.prom)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoleadoresGral;

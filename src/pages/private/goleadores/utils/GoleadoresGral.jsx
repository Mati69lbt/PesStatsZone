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

    const esOG = (nombre) =>
      !nombre ? false : String(nombre).toLowerCase().includes("__og__");

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

      // ✅ PJ debe salir de participación (starters + substitutes), no de goles
      const participantes = [
        ...(Array.isArray(p?.starters) ? p.starters : []),
        ...(Array.isArray(p?.substitutes) ? p.substitutes : []),
      ];

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

      // ✅ Goles / dobletes / tripletes salen de goleadoresActiveClub
      listaRaw.forEach((g) => {
        const nombre = (g?.name || g?.nombre || "").toString().trim();
        if (!nombre || esOG(nombre)) return;

        const goles = computeGolesEvento(g);
        if (!goles) return;

        // asegurar estructura aunque no esté en starters/substitutes
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

    const lista = Object.entries(resumen)
      .map(([nombre, data]) => ({
        nombre,
        general: buildAmb(data.general),
        local: buildAmb(data.local),
        visitante: buildAmb(data.visitante),
        neutro: buildAmb(data.neutro),
      }))
      .filter((x) => (x[ordenAmbito]?.goles ?? 0) > 0);

    const sorted = lista.sort((a, b) => {
      // helper nombre normalizado
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();

      if (ordenCampo === "nombre") {
        return ordenDireccion === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }

      const amb = ordenAmbito;
      const valA = a[amb]?.[ordenCampo] ?? 0;
      const valB = b[amb]?.[ordenCampo] ?? 0;

      // 1) criterio principal (numérico)
      const diff = ordenDireccion === "asc" ? valA - valB : valB - valA;
      if (diff !== 0) return diff;

      // 2) desempate alfabético siempre ascendente
      return nameA.localeCompare(nameB);
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

  const ambitoBg = (amb) => {
    switch (amb) {
      case "local":
        return "bg-emerald-50";
      case "visitante":
        return "bg-amber-50";
      default:
        return "bg-sky-50"; // general
    }
  };

  const campoHighlight = "bg-slate-200/60"; // o bg-indigo-100 etc

  const isCampo = (campo, target) => campo === target;

  return (
    <div className="mt-6">
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

      {/* { tabla para celulares verticales} */}
      {/* MOBILE (<640): tabla apilada por jugador */}
      <div className="sm:hidden max-h-[80vh] overflow-auto border rounded">
        <table className="w-full border-collapse text-[11px] tabular-nums">
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700">
            <tr>
              <th className="border px-2 py-2 text-center w-10">#</th>
              <th className="border px-2 py-2 text-left">Jugador</th>
              <th className="border px-2 py-2 text-center w-12">PJ</th>
              <th className="border px-2 py-2 text-center w-12">G</th>
              <th className="border px-2 py-2 text-center w-12">x2</th>
              <th className="border px-2 py-2 text-center w-12">x3</th>
              <th className="border px-2 py-2 text-center w-16">Prom</th>
            </tr>
          </thead>

          <tbody>
            {goleadoresOrdenados.map((g, idx) => (
              <React.Fragment key={g.nombre}>
                {/* Fila 1: General (con nombre del jugador) */}
                <tr className="bg-white">
                  <td
                    className="border px-2 py-2 text-center font-bold align-middle"
                    rowSpan={3}
                  >
                    {idx + 1}
                  </td>

                  <td className="border px-2 py-2 text-left font-semibold">
                    <div
                      className="font-bold underline text-[12px] leading-tight truncate max-w-[180px]"
                      title={prettySafe(g.nombre)}
                    >
                      {prettySafe(g.nombre)}
                    </div>
                  </td>

                  <td className="border px-2 py-2 text-center">
                    {g.general.pj}
                  </td>
                  <td className="border px-2 py-2 text-center">
                    {g.general.goles}
                  </td>
                  <td className="border px-2 py-2 text-center">
                    {g.general.x2}
                  </td>
                  <td className="border px-2 py-2 text-center">
                    {g.general.x3}
                  </td>
                  <td className="border px-2 py-2 text-center">
                    {formatProm(g.general.prom)}
                  </td>
                </tr>

                {/* Fila 2: Local */}
                <tr className={ambitoBg("local")}>
                  <td className="border px-2 py-2 text-left">
                    <div className="font-semibold">Local</div>
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "local" && ordenCampo === "pj"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.local.pj}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "local" && ordenCampo === "goles"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.local.goles}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "local" && ordenCampo === "x2"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.local.x2}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "local" && ordenCampo === "x3"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.local.x3}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "local" && ordenCampo === "prom"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {formatProm(g.local.prom)}
                  </td>
                </tr>

                {/* Fila 3: Visitante */}
                <tr className={ambitoBg("visitante")}>
                  <td className="border px-2 py-2 text-left">
                    <div className="font-semibold">Visitante</div>
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "visitante" && ordenCampo === "pj"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.visitante.pj}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "visitante" && ordenCampo === "goles"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.visitante.goles}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "visitante" && ordenCampo === "x2"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.visitante.x2}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "visitante" && ordenCampo === "x3"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {g.visitante.x3}
                  </td>
                  <td
                    className={`border px-2 py-2 text-center ${
                      ordenAmbito === "visitante" && ordenCampo === "prom"
                        ? campoHighlight
                        : ""
                    }`}
                  >
                    {formatProm(g.visitante.prom)}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* { FIN tabla para celulares verticales} */}

      {/* Tabla */}
      <div className="hidden sm:block max-h-[80vh] overflow-auto">
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
                className="even:bg-slate-200 hover:bg-slate-100/70 transition-colors"
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

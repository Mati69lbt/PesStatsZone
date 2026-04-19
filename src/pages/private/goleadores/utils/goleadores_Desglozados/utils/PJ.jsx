//cspell: ignore funtions ambito setOrdenDireccion ordenDireccion totalx2 totalx Ambitos ambitos hattrick

import React, { useMemo, useState } from "react";
import { prettySafe } from "../../../../campeonatos/util/funtions";
const DEFAULT_ORDEN = { campo: "goles", dir: "desc" };

const CAMPOS = [
  { value: "nombre", label: "Nombre" },
  { value: "pj", label: "PJ" },
  { value: "goles", label: "Goles" },
  { value: "x2", label: "⚽x2" },
  { value: "x3", label: "⚽x3" },
  { value: "prom", label: "Promedio" },
];

const DIRECCIONES = [
  { value: "asc", label: "Ascendente" },
  { value: "desc", label: "Descendente" },
];

const COLS = [
  { key: "pj", label: "PJ", w: "w-12" },
  { key: "goles", label: "G", w: "w-12" },
  { key: "x2", label: "x2", w: "w-12" },
  { key: "x3", label: "x3", w: "w-12" },
  { key: "prom", label: "Prom", w: "w-16", fmt: (v) => formatProm(v) },
];

const PJ_Tabla = ({
  ambito,
  ordenCampo,
  setOrdenCampo,
  ordenDireccion,
  setOrdenDireccion,
  goleadoresOrdenados,
}) => {
  const formatProm = (num) => {
    if (!num || Number.isNaN(num)) return "0.00";
    return Number(num).toFixed(2);
  };

  const campoHighlight = "bg-slate-200/60";

  const tituloAmbito =
    ambito === "general"
      ? "General"
      : ambito === "local"
        ? "Local"
        : ambito === "visitante"
          ? "Visitante"
          : "Neutro"; // Si no es ninguno de los anteriores, es Neutro

  // ✅ TOTALES (según el ámbito actual)
  const totals = React.useMemo(() => {
    const list = goleadoresOrdenados || [];

    const totalGoles = list.reduce(
      (acc, x) => acc + (x?.[ambito]?.goles || 0),
      0,
    );
    const totalx2 = list.reduce((acc, x) => acc + (x?.[ambito]?.x2 || 0), 0);
    const totalx3 = list.reduce((acc, x) => acc + (x?.[ambito]?.x3 || 0), 0);

    // ✅ Promedio de promedios (cada jugador pesa igual)
    const sumProms = list.reduce((acc, x) => acc + (x?.[ambito]?.prom || 0), 0);
    const promProms = list.length ? sumProms / list.length : 0;

    return {
      totalGoles,
      totalx2,
      totalx3,
      promProms: Number(promProms).toFixed(2),
    };
  }, [goleadoresOrdenados, ambito]);

  if (!goleadoresOrdenados?.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No hay actividad registrada para el ámbito {tituloAmbito}.
      </p>
    );
  }

  return (
    <div className="mt-1">
      <div className="mb-2 flex w-full items-end justify-between gap-3 px-2">
        {/* Agregamos flex-1 para que se estiren equitativamente */}
        <div className="text-left flex-1">
          <div className="relative mt-2">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-wide text-sky-600 z-10">
              Campo
            </label>
            <select
              value={ordenCampo}
              onChange={(e) => setOrdenCampo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm 
                   transition-all cursor-pointer hover:border-sky-200
                   focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
            >
              {CAMPOS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Agregamos flex-1 también aquí */}
        <div className="text-left flex-1">
          <div className="relative mt-2">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-wide text-sky-600 z-10">
              Sentido
            </label>
            <select
              value={ordenDireccion}
              onChange={(e) => setOrdenDireccion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm 
                   transition-all cursor-pointer hover:border-sky-200
                   focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
            >
              {DIRECCIONES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="sm:hidden max-h-[80vh] overflow-auto border rounded">
        <table className="w-full text-left text-[14px] tabular-nums border-hidden ">
          <thead className="sticky top-0 z-20 bg-slate-100/100 border-b-4 border-slate-400">
            <tr>
              <th className="px-3 py-2 text-center text-slate-400 font-medium w-10">
                #
              </th>
              <th className="px-3 py-2 text-slate-800 font-bold uppercase tracking-tight">
                Jugador
              </th>

              {/* Columnas de Datos */}
              {[
                { id: "pj", label: "PJ" },
                { id: "goles", label: "G" },
                { id: "x2", label: "X2" },
                { id: "x3", label: "X3" },
                { id: "prom", label: "PROM" },
              ].map((col) => (
                <th
                  key={col.id}
                  className={`px-3 py-2 text-center w-22 transition-colors ${
                    ordenCampo === col.id
                      ? "text-blue-600 font-black border-b-4 border-blue-600"
                      : "text-slate-400 font-medium"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {goleadoresOrdenados.map((g, idx) => {
              const a = g?.[ambito] || {};
              return (
                <tr
                  key={g.nombre}
                  className="group transition-colors hover:bg-blue-50 odd:bg-white even:bg-slate-100/100"
                >
                  {/* Número de posición con color suave */}
                  <td className="px-3 py-3 text-center text-slate-400 font-medium w-10">
                    {idx + 1}
                  </td>

                  {/* Nombre del jugador con jerarquía clara */}
                  <td className="px-3 py-3 text-left">
                    <div
                      className="font-bold text-slate-700 text-[14px] leading-tight truncate max-w-[180px]"
                      title={prettySafe(g.nombre)}
                    >
                      {prettySafe(g.nombre)}
                    </div>
                  </td>

                  {/* Datos numéricos limpios */}
                  <td className="px-3 py-3 text-center text-slate-600 font-medium">
                    {a.pj ?? 0}
                  </td>

                  {/* Resaltado sutil en la columna de goles si no está ordenada por otra cosa */}
                  <td
                    className={`px-3 py-3 text-center font-bold ${
                      ordenCampo === "goles"
                        ? "text-blue-600 bg-blue-50/30"
                        : "text-slate-600"
                    }`}
                  >
                    {a.goles ?? 0}
                  </td>

                  <td
                    className={`px-3 py-3 text-center ${ordenCampo === "x2" ? "text-blue-600 bg-blue-50/20" : "text-slate-500"}`}
                  >
                    {a.x2 ?? 0}
                  </td>

                  <td
                    className={`px-3 py-3 text-center ${ordenCampo === "x3" ? "text-blue-600 bg-blue-50/20" : "text-slate-500"}`}
                  >
                    {a.x3 ?? 0}
                  </td>

                  <td
                    className={`px-3 py-3 text-center font-light italic ${ordenCampo === "prom" ? "text-blue-600 bg-blue-50/20 font-normal" : "text-slate-600"}`}
                  >
                    {formatProm(a.prom ?? 0)}
                  </td>
                </tr>
              );
            })}
            {goleadoresOrdenados.length > 0 && (
              <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-bold text-slate-700">
                <td
                  className="px-3 py-4 text-right text-[14px] uppercase tracking-widest text-slate-400"
                  colSpan={2}
                >
                  Totales
                </td>

                {/* PJ Total (si lo tienes en tus totals) */}
                <td className="px-3 py-4 text-center text-slate-600"></td>

                {/* Goles Total - Resaltado */}
                <td className="px-3 py-4 text-center text-blue-700 bg-blue-50/20">
                  {totals.totalGoles}
                </td>

                {/* x2 Total */}
                <td className="px-3 py-4 text-center text-slate-600">
                  {totals.totalx2}
                </td>

                {/* x3 Total */}
                <td className="px-3 py-4 text-center text-slate-600">
                  {totals.totalx3}
                </td>

                {/* Promedio General */}
                <td className="px-3 py-4 text-center text-slate-700">
                  {totals.promProms}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="hidden sm:block max-h-[80vh] overflow-auto">
        <table className="table-fixed border-collapse mx-auto min-w-[520px] md:min-w-[620px] text-[11px] md:text-sm tabular-nums text-slate-600">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr className="bg-white text-slate-400 border-b border-slate-100">
              <th className="px-3 py-4 text-center sticky left-0 bg-white z-20 w-10 font-medium">
                #
              </th>
              <th className="px-3 py-4 text-left sticky left-10 bg-white z-20 w-40 font-bold text-slate-800 uppercase tracking-tight">
                Jugador
              </th>

              {[
                { id: "pj", label: "PJ" },
                { id: "goles", label: "G" },
                { id: "x2", label: "⚽x2" },
                { id: "x3", label: "⚽x3" },
                { id: "prom", label: "P" },
              ].map((col) => (
                <th
                  key={col.id}
                  className={`px-2 py-4 text-center w-14 transition-colors font-semibold ${
                    ordenCampo === col.id ? "text-blue-600 bg-blue-50/50" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {goleadoresOrdenados.map((g, idx) => {
              const a = g?.[ambito] || {};

              return (
                <tr
                  key={g.nombre}
                  className="group transition-colors hover:bg-slate-50 even:bg-slate-50/40"
                >
                  <td className="px-3 py-3 text-center sticky left-0 bg-inherit z-10 w-10 text-slate-300">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-3 text-left font-bold sticky left-10 bg-inherit z-10 w-40 text-slate-700 truncate">
                    {prettySafe(g.nombre)}
                  </td>

                  <td
                    className={`px-2 py-3 text-center ${ordenCampo === "pj" ? "bg-blue-50/30 font-bold" : ""}`}
                  >
                    {a.pj ?? 0}
                  </td>

                  <td
                    className={`px-2 py-3 text-center font-black ${
                      ordenCampo === "goles"
                        ? "text-blue-600 bg-blue-50/50"
                        : "text-slate-800"
                    }`}
                  >
                    {a.goles ?? 0}
                  </td>

                  <td
                    className={`px-2 py-3 text-center ${ordenCampo === "x2" ? "bg-blue-50/30 font-bold" : ""}`}
                  >
                    {a.x2 ?? 0}
                  </td>
                  <td
                    className={`px-2 py-3 text-center ${ordenCampo === "x3" ? "bg-blue-50/30 font-bold" : ""}`}
                  >
                    {a.x3 ?? 0}
                  </td>

                  <td
                    className={`px-2 py-3 text-center italic text-slate-400 ${
                      ordenCampo === "prom"
                        ? "bg-blue-50/30 font-bold text-blue-600"
                        : ""
                    }`}
                  >
                    {formatProm(a.prom ?? 0)}
                  </td>
                </tr>
              );
            })}

            {/* Fila de Totales Estilizada */}
            {goleadoresOrdenados.length > 0 && (
              <tr className=" text-black font-bold ">
                <td
                  className="px-3 py-4 text-right text-[10px] uppercase tracking-widest opacity-60"
                  colSpan={2}
                >
                  Totales
                </td>
                <td className="px-2 py-2 text-center"></td>
                <td className="px-2 py-2 text-center text-blue-400">
                  {totals.totalGoles}
                </td>
                <td className="px-2 py-2 text-center">{totals.totalx2}</td>
                <td className="px-2 py-2 text-center">{totals.totalx3}</td>
                <td className="px-2 py-2 text-center text-slate-400">
                  {totals.promProms}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* opcional: título abajo */}
      <div className="mt-2 text-center text-xs text-slate-500">
        Vista: <span className="font-semibold">{tituloAmbito}</span>
      </div>
    </div>
  );
};

const PJ = ({ scope, matches }) => {
  const safeMatches = Array.isArray(matches) ? matches : [];

  const [ordenCampo, setOrdenCampo] = useState(DEFAULT_ORDEN.campo);
  const [ordenDireccion, setOrdenDireccion] = useState(DEFAULT_ORDEN.dir);

  const goleadoresOrdenados = useMemo(() => {
    const resumen = {};

    const computeGolesEvento = (g) => {
      if (!g) return 0;
      const t = !!(g.triplete || g.hattrick);
      if (t && g.doblete && g.gol) return 6; // 3 + 2 + 1
      if (t && g.doblete) return 5; // 3 + 2
      if (t && g.gol) return 4; // 3 + 1
      if (t) return 3;
      if (g.doblete && g.gol) return 3; // 2 + 1 (si lo usás en tu modelo)
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
        if (p?.local === true) {
          condition = "local";
        } else if (p?.local === false) {
          condition = "visitante";
        } else {
          // Si no es true ni false, se asume neutro
          condition = "neutro";
        }
      }

      const ambitos = ["general"];

      if (condition === "local") {
        ambitos.push("local");
      } else if (condition === "visitante") {
        ambitos.push("visitante");
      } else if (condition === "neutro" || condition === "neutro") {
        // Estandarizamos siempre a "neutro" para que coincida con tus pestañas
        ambitos.push("neutro");
      }

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
          if (goles === 4) resumen[nombre][amb].x3 += 1;
          if (goles === 5) {
            resumen[nombre][amb].x3 += 1; // hat-trick
            resumen[nombre][amb].x2 += 1; // doblete
          }
          if (goles === 6) resumen[nombre][amb].x3 += 2;
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
      .filter((x) => (x?.[scope]?.pj ?? 0) > 0);

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
    <PJ_Tabla
      ambito={scope} // ✅ CAMBIO: ámbito fijo por tab
      ordenCampo={ordenCampo}
      setOrdenCampo={setOrdenCampo}
      ordenDireccion={ordenDireccion}
      setOrdenDireccion={setOrdenDireccion}
      goleadoresOrdenados={goleadoresOrdenados}
    />
  );
};

export default PJ;

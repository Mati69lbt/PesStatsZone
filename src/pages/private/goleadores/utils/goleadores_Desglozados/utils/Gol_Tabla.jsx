import React from "react";
import { prettySafe } from "../../../../campeonatos/util/funtions";
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

const Gol_Tabla = ({
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
      : "Visitante";

  if (!goleadoresOrdenados?.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No hay goleadores para {tituloAmbito}.
      </p>
    );
  }

  return (
    <div className="mt-1">
      <div className="mb-2 flex flex-wrap items-end justify-center gap-3">
        <label className="w-max max-w-[220px]">
          <span className="text-sm font-medium text-slate-700">Campo</span>
          <select
            value={ordenCampo}
            onChange={(e) => setOrdenCampo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CAMPOS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="w-full max-w-[220px]">
          <span className="text-sm font-medium text-slate-700">Orden</span>
          <select
            value={ordenDireccion}
            onChange={(e) => setOrdenDireccion(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DIRECCIONES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sm:hidden max-h-[80vh] overflow-auto border rounded">
        <table className="w-full border-collapse text-[11px] tabular-nums">
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700">
            <tr>
              <th className="border px-2 py-2 text-center w-10">#</th>
              <th className="border px-2 py-2 text-left">Jugador</th>
              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "pj" ? campoHighlight : ""
                }`}
              >
                PJ
              </th>
              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "goles" ? campoHighlight : ""
                }`}
              >
                G
              </th>
              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "x2" ? campoHighlight : ""
                }`}
              >
                x2
              </th>
              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "x3" ? campoHighlight : ""
                }`}
              >
                x3
              </th>
              <th
                className={`border px-2 py-2 text-center w-16 ${
                  ordenCampo === "prom" ? campoHighlight : ""
                }`}
              >
                Prom
              </th>
            </tr>
          </thead>

          <tbody>
            {goleadoresOrdenados.map((g, idx) => {
              const a = g?.[ambito] || {};
              return (
                <tr
                  key={g.nombre}
                  className="odd:bg-white even:bg-slate-100/60 active:bg-slate-200/60 transition-colors"
                >
                  <td className="border px-2 py-2 text-center font-bold">
                    {idx + 1}
                  </td>
                  <td className="border px-2 py-2 text-left font-semibold">
                    <div
                      className="font-bold text-[14px] leading-tight truncate max-w-[180px]"
                      title={prettySafe(g.nombre)}
                    >
                      {prettySafe(g.nombre)}
                    </div>
                  </td>
                  <td className="border px-2 py-2 text-center">{a.pj ?? 0}</td>
                  <td className="border px-2 py-2 text-center">
                    {a.goles ?? 0}
                  </td>
                  <td className="border px-2 py-2 text-center">{a.x2 ?? 0}</td>
                  <td className="border px-2 py-2 text-center">{a.x3 ?? 0}</td>
                  <td className="border px-2 py-2 text-center">
                    {formatProm(a.prom ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="hidden sm:block max-h-[80vh] overflow-auto">
        <table className="table-fixed border-collapse mx-auto min-w-[520px] md:min-w-[620px] text-[11px] md:text-sm tabular-nums">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-100 text-slate-700">
              <th className="border px-2 py-2 text-center sticky left-0 bg-slate-100 z-20 w-10">
                #
              </th>
              <th className="border px-2 py-2 text-left sticky left-10 bg-slate-100 z-20 w-40">
                Jugador
              </th>

              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "pj" ? campoHighlight : ""
                }`}
              >
                PJ
              </th>
              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "goles" ? campoHighlight : ""
                }`}
              >
                G
              </th>
              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "x2" ? campoHighlight : ""
                }`}
              >
                ⚽x2
              </th>
              <th
                className={`border px-2 py-2 text-center w-12 ${
                  ordenCampo === "x3" ? campoHighlight : ""
                }`}
              >
                ⚽x3
              </th>
              <th
                className={`border px-2 py-2 text-center w-16 ${
                  ordenCampo === "prom" ? campoHighlight : ""
                }`}
              >
                P
              </th>
            </tr>
          </thead>

          <tbody>
            {goleadoresOrdenados.map((g, idx) => {
              const a = g?.[ambito] || {};
              return (
                <tr
                  key={g.nombre}
                  className="even:bg-slate-200 hover:bg-slate-100/70 transition-colors"
                >
                  <td className="border px-2 py-2 text-center sticky left-0 bg-white z-10 w-10">
                    {idx + 1}
                  </td>
                  <td className="border px-2 py-2 text-left font-semibold sticky left-10 bg-white z-10 w-40 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {prettySafe(g.nombre)}
                  </td>

                  <td className="border px-2 py-2 text-center">{a.pj ?? 0}</td>
                  <td className="border px-2 py-2 text-center">
                    {a.goles ?? 0}
                  </td>
                  <td className="border px-2 py-2 text-center">{a.x2 ?? 0}</td>
                  <td className="border px-2 py-2 text-center">{a.x3 ?? 0}</td>
                  <td className="border px-2 py-2 text-center">
                    {formatProm(a.prom ?? 0)}
                  </td>
                </tr>
              );
            })}
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

export default Gol_Tabla;

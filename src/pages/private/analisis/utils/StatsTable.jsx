import React from "react";
import { pretty } from "../../match/utils/pretty";

const StatsTable = ({ title, rows, colorize = true }) => {
  const order = ["General", "Local", "Visitante"];

  // === Reglas del semáforo (como en tu Analisis viejo) ===
  function getRowBg({ g = 0, e = 0, p = 0 }) {
    if (!colorize) return "";
    if (g >= e && g > p) return "bg-green-100";
    if (p > g && p >= e) return "bg-red-100";
    if (g === p && g > e) return "bg-yellow-100";
    if (g === e && g === p) return "bg-yellow-100";
    if (e >= g && e >= p) return "bg-yellow-100";
    return "bg-gray-100";
  }

  function getDifBg(dif) {
    if (!colorize) return "";
    if (dif > 0) return "bg-green-200 font-semibold";
    if (dif < 0) return "bg-red-200 font-semibold";
    return "bg-yellow-200 font-semibold";
  }

  // celdita numérica normal (aplica color por resultado dominante)
  const Cell = ({ children, bg }) => (
    <td className={`px-2.5 py-1.5 border-b border-gray-100 text-center ${bg}`}>
      {children}
    </td>
  );

  // celdita para DIF (color independiente por signo)
  const DifCell = ({ value }) => (
    <td
      className={`px-2.5 py-1.5 border-b border-gray-100 text-center ${getDifBg(
        value
      )}`}
    >
      {value}
    </td>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-3">
      {/* Título */}
      <div className="bg-blue-50 px-2.5 py-1.5 font-semibold text-sm text-center">
        {pretty(title)}
      </div>

      {/* Tabla */}
      <table className="w-full border-collapse text-sm">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              Tipo
            </th>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              Pj
            </th>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              G
            </th>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              E
            </th>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              P
            </th>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              GF
            </th>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              GC
            </th>
            <th className="px-2.5 py-1.5 text-left border-b border-gray-300">
              DIF
            </th>
          </tr>
        </thead>
        <tbody>
          {order.map((k, i) => {
            const r = rows[k] || {
              pj: 0,
              g: 0,
              e: 0,
              p: 0,
              gf: 0,
              gc: 0,
              dif: 0,
            };

            const rowBg = getRowBg(r); // color para pj,g,e,p,gf,gc

            return (
              <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {/* Tipo sin color de resultado (como en tu versión vieja) */}
                <td className="px-2.5 py-1.5 border-b border-gray-100">{k}</td>

                <Cell bg={rowBg}>{r.pj}</Cell>
                <Cell bg={rowBg}>{r.g}</Cell>
                <Cell bg={rowBg}>{r.e}</Cell>
                <Cell bg={rowBg}>{r.p}</Cell>
                <Cell bg={rowBg}>{r.gf}</Cell>
                <Cell bg={rowBg}>{r.gc}</Cell>

                {/* DIF con color propio */}
                <DifCell value={r.dif} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;

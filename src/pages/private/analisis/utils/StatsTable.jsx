import React from "react";
import { pretty } from "../../match/utils/pretty";

const StatsTable = ({ title, rows, colorize = true }) => {
  const order = ["General", "Local", "Visitante", "Neutral"];

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

  // celdita numérica normal (aplica color por resultado dominante)
  const Cell = ({ children, bg }) => (
    <td className={`px-1 py-1 border-b border-gray-100 text-center ${bg}`}>
      {children}
    </td>
  );

  const PtsEfecCell = ({ g = 0, e = 0, pj = 0, rowBg = "" }) => {
    const G = Number(g || 0);
    const E = Number(e || 0);
    const PJ = Number(pj || 0);

    const obtenidos = G * 3 + E * 1;
    const posibles = PJ * 3;
    const efec = posibles > 0 ? Math.round((obtenidos / posibles) * 100) : 0;

    return (
      <td className={`px-1 py-1 border-b border-gray-100 text-center ${rowBg}`}>
        <div className="flex flex-col items-center leading-none">
          <span className="text-[10px] font-extrabold tabular-nums text-black">
            {obtenidos} / {posibles}
          </span>
          <span className="mt-0.5 text-[9px] tabular-nums text-slate-600">
            {efec}%
          </span>
        </div>
      </td>
    );
  };

  const DifCell = ({ value = 0, rowBg = "" }) => {
    const v = Number(value || 0);

    const ring =
      v > 0 ? "ring-green-400" : v < 0 ? "ring-red-400" : "ring-yellow-400";

    return (
      <td className={`px-1 py-1 border-b border-gray-100 text-center ${rowBg}`}>
        <span
          className={`mx-auto inline-flex items-center justify-center rounded-full w-7 h-7 bg-white ring-2 ${ring} text-[10px] font-extrabold text-black`}
          title={`DIF: ${v}`}
        >
          {v}
        </span>
      </td>
    );
  };

  // celdita para G/P (G - P) con círculo verde/rojo/amarillo
  const GpCell = ({ g = 0, p = 0, rowBg = "" }) => {
    const diff = Number(g || 0) - Number(p || 0);

    const accent =
      diff > 0
        ? "border-green-400 ring-green-300"
        : diff < 0
        ? "border-red-400 ring-red-300"
        : "border-yellow-400 ring-yellow-300";

    const colorText =
      diff > 0
        ? "text-green-600"
        : diff < 0
        ? "text-red-600"
        : "text-amber-700";

    return (
      <td className={`px-1 py-1 border-b border-gray-100 text-center ${rowBg}`}>
        <span
          className={`mx-auto inline-flex items-center rounded-full bg-white px-2 py-1 text-[10px] font-extrabold
          border ring-2 ${accent}`}
          title={`G/P = ${g} - ${p} = ${diff}`}
        >
          <span className={`tabular-nums ${colorText}`}>{diff}</span>
        </span>
      </td>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-3">
      {/* Título */}
      <div className="bg-blue-50 px-2 py-1 font-semibold text-sm text-center">
        {pretty(title)}
      </div>

      {/* Tabla */}
      <table className="w-full text-xs border-separate border-spacing-px bg-white">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-2 py-1 text-left border-b border-gray-300">
              Tipo
            </th>
            <th className="px-2 py-1 text-left border-b border-gray-300">Pj</th>
            <th className="px-2 py-1 text-left border-b border-gray-300">G</th>
            <th className="px-2 py-1 text-left border-b border-gray-300">E</th>
            <th className="px-2 py-1 text-left border-b border-gray-300">P</th>
            <th className="px-2 py-1 text-left border-b border-gray-300">
              G/P
            </th>
            <th className="px-2 py-1 text-left border-b border-gray-300">GF</th>
            <th className="px-2 py-1 text-left border-b border-gray-300">GC</th>
            <th className="px-2 py-1 text-left border-b border-gray-300">
              DIF
            </th>
            <th className="px-2 py-1 text-left border-b border-gray-300">
              PTS/EFEC
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
              <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                {/* Tipo sin color de resultado (como en tu versión vieja) */}
                <td className="px-2 py-1 border-b border-gray-100">{k}</td>

                <Cell bg={rowBg}>{r.pj}</Cell>
                <Cell bg={rowBg}>{r.g}</Cell>
                <Cell bg={rowBg}>{r.e}</Cell>
                <Cell bg={rowBg}>{r.p}</Cell>
                <GpCell g={r.g} p={r.p} rowBg={rowBg} />
                <Cell bg={rowBg}>{r.gf}</Cell>
                <Cell bg={rowBg}>{r.gc}</Cell>
                <DifCell value={r.dif} rowBg={rowBg} />
                <PtsEfecCell g={r.g} e={r.e} pj={r.pj} rowBg={rowBg} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;

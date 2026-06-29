import React from "react";
import { pretty } from "../../../match/utils/pretty";
import { sortClubs } from "./BuildClubs";


const getRowBg = ({ g = 0, e = 0, p = 0 }) => {
  if (g >= e && g > p) return "bg-green-100";
  if (p > g && p >= e) return "bg-red-100";
  if (g === p && g > e) return "bg-yellow-100";
  if (e >= g && e >= p) return "bg-yellow-100";
  return "bg-gray-100";
};

const DifCell = ({ value = 0, bg = "" }) => {
  const v = Number(value || 0);
  const ring =
    v > 0 ? "ring-green-400" : v < 0 ? "ring-red-400" : "ring-yellow-400";
  return (
    <td className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}>
      <span
        className={`mx-auto inline-flex items-center justify-center rounded-full w-7 h-7 bg-white ring-2 ${ring} text-[10px] font-extrabold text-black`}
      >
        {Math.abs(v)}
      </span>
    </td>
  );
};

const GpCell = ({ g = 0, p = 0, bg = "" }) => {
  const diff = Number(g || 0) - Number(p || 0);
  const accent =
    diff > 0
      ? "border-green-400 ring-green-300"
      : diff < 0
        ? "border-red-400 ring-red-300"
        : "border-yellow-400 ring-yellow-300";
  const colorText =
    diff > 0 ? "text-green-700" : diff < 0 ? "text-red-700" : "text-amber-800";
  return (
    <td className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}>
      <span
        className={`mx-auto inline-flex items-center rounded-full bg-white px-2 py-1 text-[10px] font-extrabold border ring-2 ${accent}`}
      >
        <span className={`tabular-nums ${colorText}`}>{Math.abs(diff)}</span>
      </span>
    </td>
  );
};

const EfecCell = ({ g = 0, e = 0, pj = 0, bg = "" }) => {
  const obtenidos = g * 3 + e;
  const posibles = pj * 3;
  const efec = posibles > 0 ? Math.round((obtenidos / posibles) * 100) : 0;
  return (
    <td className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}>
      <div className="flex flex-col items-center leading-none">
        <span className="text-[10px] font-extrabold tabular-nums text-black">
          {obtenidos} / {posibles}
        </span>
        <span className="mt-0.5 text-[10px] tabular-nums text-slate-600">
          {efec}%
        </span>
      </div>
    </td>
  );
};

const ClubsTable = ({
  title,
  list,
  sortField,
  sortDir,
  onSort,
  isOpen,
  onToggle,
}) => {
  const condKey =
    title === "Local"
      ? "local"
      : title === "Visitante"
        ? "visitante"
        : title === "Neutral"
          ? "neutral"
          : null;

  const sorted = sortClubs(list, sortField, sortDir, condKey);
  const getRow = (item) => (condKey ? item[condKey] : item);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-2">
      <div
        onClick={onToggle}
        className="cursor-pointer flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-slate-200 hover:bg-blue-100 transition-colors"
      >
        <span className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
          {title}
        </span>
        <span className="text-slate-500 text-xs">{isOpen ? "▲" : "▼"}</span>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-max text-xs border-separate border-spacing-px bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-2 py-1 text-left border-b border-gray-300">
                  Club 
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  PJ
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  G
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  E
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  P
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  G/P
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  GF
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  GC
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  DIF
                </th>
                <th className="px-2 py-1 text-center border-b border-gray-300">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, i) => {
                const r = getRow(item);
                if (!r || r.pj === 0) return null;
                const bg = getRowBg(r);
                return (
                  <tr
                    key={`${item.club}-${item.periodo}-${i}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-1 py-1 border-b border-gray-100 w-[110px]">
                      <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-slate-400 text-[12px]">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {pretty(item.club)}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {item.periodo}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}
                    >
                      {r.pj}
                    </td>
                    <td
                      className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}
                    >
                      {r.g}
                    </td>
                    <td
                      className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}
                    >
                      {r.e}
                    </td>
                    <td
                      className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}
                    >
                      {r.p}
                    </td>
                    <GpCell g={r.g} p={r.p} bg={bg} />
                    <td
                      className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}
                    >
                      {r.gf}
                    </td>
                    <td
                      className={`px-1 py-1 text-center border-b border-gray-100 ${bg}`}
                    >
                      {r.gc}
                    </td>
                    <DifCell value={r.dif} bg={bg} />
                    <EfecCell g={r.g} e={r.e} pj={r.pj} bg={bg} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClubsTable;

import React from "react";
import { prettySafe } from "../../campeonatos/util/funtions";

const rankStyles = (index) => {
  if (index === 0) return { bg: "bg-amber-50", icon: "🥇", isTop3: true };
  if (index === 1) return { bg: "bg-slate-50", icon: "🥈", isTop3: true };
  if (index === 2) return { bg: "bg-orange-50/40", icon: "🥉", isTop3: true };
  return { bg: "bg-white", icon: `${index + 1}º`, isTop3: false };
};

const TopGoleadores = ({ playersStats = {}, topN = 7 }) => {
  const lista = Object.entries(playersStats)
    .map(([name, st]) => ({ name, goals: st?.goals ?? 0 }))
    .filter((x) => x.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, topN);

  if (lista.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="max-w-full mx-auto rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header minimalista */}
        <div className="px-3 py-2 border-b border-slate-200 text-[10px] md:text-xs font-semibold tracking-wide text-center uppercase text-slate-800">
          Goleadores
        </div>

        <table className="w-full text-[11px] md:text-sm border-collapse">
          <tbody>
            {/* Fila 1: ranking + goles (horizontal, una columna por jugador) */}
            <tr>
              {lista.map((j, i) => {
                const { bg, icon, isTop3 } = rankStyles(i);
                return (
                  <td
                    key={`gpos-${i}`}
                    className={`px-2 py-2 text-center border-r last:border-r-0 border-slate-100 ${bg}`}
                  >
                    <div className="flex flex-row items-center justify-center gap-1">
                      <span className="text-[11px] md:text-xs text-slate-500">
                        {icon}
                      </span>

                      <span className="flex flex-row items-baseline gap-1 whitespace-nowrap">
                        <span
                          className={`tabular-nums ${
                            isTop3
                              ? "font-bold text-xs md:text-sm"
                              : "font-semibold text-[11px]"
                          } text-slate-900`}
                        >
                          {j.goals}
                        </span>

                        <span className="text-[9px] text-slate-400 leading-none">
                          gol{j.goals !== 1 ? "es" : ""}
                        </span>
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Fila 2: nombres (alineados con la columna de arriba) */}
            <tr>
              {lista.map((j, i) => {
                const { bg, isTop3 } = rankStyles(i);
                return (
                  <td
                    key={`gname-${i}`}
                    className={`px-2 pb-2 pt-1 text-center border-r last:border-r-0 border-t border-slate-100 ${bg}`}
                  >
                    <span
                      className={`truncate ${
                        isTop3
                          ? "font-semibold text-slate-800"
                          : "text-slate-600"
                      }`}
                    >
                      {prettySafe(j.name)}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopGoleadores;

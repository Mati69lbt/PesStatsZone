import React from "react";
import { prettySafe } from "../../campeonatos/util/funtions";

const rankStyles = (index) => {
  if (index === 0) return { bg: "bg-amber-50", icon: "🥇", isTop3: true };
  if (index === 1) return { bg: "bg-slate-50", icon: "🥈", isTop3: true };
  if (index === 2) return { bg: "bg-orange-50/40", icon: "🥉", isTop3: true };
  return { bg: "bg-white", icon: `${index + 1}º`, isTop3: false };
};

const TopGoleadores = ({
  playersStats = {},
  topN = 7,
  mode = "horizontal",
  className = "",
}) => {
  const lista = Object.entries(playersStats)
    .map(([name, st]) => ({ name, goals: st?.goals ?? 0 }))
    .filter((x) => x.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, topN);

  if (lista.length === 0) return null;

  if (mode === "vertical") {
    return (
      <div className={`${className}`}>
        <div className="w-max mx-auto rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-200 text-[10px] font-semibold tracking-wide text-center uppercase text-slate-800">
            Goleadores
          </div>

          <table className="w-full text-[11px] border-collapse">
            <tbody>
              {lista.map((j, i) => {
                const { bg, icon, isTop3 } = rankStyles(i);
                return (
                  <tr
                    key={j.name}
                    className={`${bg} border-t border-slate-100`}
                  >
                    {/* Apellido */}
                    <td
                      className={`px-3 py-2 text-left ${
                        isTop3
                          ? "font-semibold text-slate-800"
                          : "text-slate-700"
                      }`}
                    >
                      {prettySafe(j.name)}
                    </td>

                    {/* Goles + emoji */}
                    <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums font-bold text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-slate-500">{icon}</span>
                        <span>{j.goals}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  // HORIZONTAL (default)
  return (
    <div className={`mt-4 ${className} md:hidden sm:hidden`}>
      <div className="w-full mx-auto rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full min-w-max text-[11px] border-collapse">
          <tbody>
            {/* Fila 1: ranking */}
            <tr className="bg-sky-50 border-b border-slate-200 text-lg">
              {lista.map((j, i) => {
                const { icon } = rankStyles(i);
                return (
                  <td
                    key={`r-${j.name}`}
                    className="px-3 py-2 text-center whitespace-nowrap font-semibold text-slate-700"
                  >
                    {icon}
                  </td>
                );
              })}
            </tr>

            {/* Fila 2: goles */}
            <tr className="border-b border-slate-100">
              {lista.map((j) => (
                <td
                  key={`g-${j.name}`}
                  className="px-1 py-1 text-center whitespace-nowrap tabular-nums font-bold text-slate-900 text-lg"
                >
                  {j.goals}
                </td>
              ))}
            </tr>

            {/* Fila 3: apellido */}
            <tr>
              {lista.map((j, i) => {
                const { bg, isTop3 } = rankStyles(i);
                return (
                  <td
                    key={`n-${j.name}`}
                    className={`px-1 py-1 text-center whitespace-nowrap text-sm ${bg} ${
                      isTop3 ? "font-semibold text-slate-800" : "text-slate-700"
                    }`}
                  >
                    {prettySafe(j.name)}
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

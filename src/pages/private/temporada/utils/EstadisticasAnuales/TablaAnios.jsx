import React from "react";
const rankStyles = (index) => {
  if (index === 0) return { bg: "bg-amber-50", icon: "🥇" };
  if (index === 1) return { bg: "bg-slate-50", icon: "🥈" };
  if (index === 2) return { bg: "bg-orange-50/40", icon: "🥉" };
  return { bg: "bg-white", icon: `${index + 1}º` };
};
const TablaAnios = ({ title, list, isOpen, onToggle }) => {
  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header clickeable */}
      <div
        onClick={onToggle}
        className="cursor-pointer hover:bg-sky-100 transition-colors flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-sky-50"
      >
        <span className="text-[10px] font-semibold tracking-wide uppercase text-slate-800">
          {title}
        </span>
        <span className="text-slate-500 text-xs">{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* Contenido colapsable */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <table className="w-full text-[11px] border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[9px] uppercase text-slate-500 font-bold">
              <th className="w-[15%] px-1 py-2 text-center">Pos</th>
              <th className="w-[55%] px-2 py-2 text-center">Año</th>
              <th className="w-[30%] px-1 py-2 text-center">Goles</th>
            </tr>
          </thead>
          <tbody>
            {!list || list.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-3 text-center text-slate-400 text-[11px]"
                >
                  Sin datos
                </td>
              </tr>
            ) : (
              list.map((j, i) => {
                const { bg, icon } = rankStyles(i);
                return (
                  <tr
                    key={`${j.year}-${i}`}
                    className={`${bg} border-b border-slate-100 hover:bg-blue-50/30 transition-colors`}
                  >
                    <td className="px-1 py-2 text-center font-bold">{icon}</td>
                    <td className="px-2 py-2 text-center font-mono text-slate-700 font-semibold">
                      {j.year}
                    </td>
                    <td className="px-1 py-2 text-center font-black text-slate-900 bg-slate-50/50">
                      {j.goals}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaAnios;

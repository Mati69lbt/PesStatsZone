import { useState } from "react";
import { TipoTable } from "./TablaRachaCap";
import { COND_CFG, SORT_OPTS } from "./rachaCap";

export const CondAccordion = ({ cond, streaks }) => {
  const [isOpen, setIsOpen] = useState(cond === "General");
  const [sortField, setSortField] = useState("racha");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (key === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(key);
      setSortDir("desc");
    }
  };

  const totalRachas = ["invictos", "ganados", "empatados", "perdidos"].reduce(
    (s, t) => s + (streaks[t]?.[cond]?.length || 0),
    0,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 border-b-2 ${COND_CFG[cond]} rounded-t-2xl focus:outline-none`}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
            {cond}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {totalRachas} racha{totalRachas !== 1 ? "s" : ""}
          </span>
        </div>
        <span
          className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="p-1 space-y-3 min-w-0 overflow-hidden">
          {/* botones de ordenamiento */}
          <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
            {SORT_OPTS.map((o) => {
              const active = sortField === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => handleSort(o.key)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    active
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {o.label}
                  {active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </button>
              );
            })}
          </div>

          {/* tablas por tipo */}
          {["invictos", "ganados", "empatados", "perdidos"].map((tipo) => (
            <TipoTable
              key={tipo}
              tipo={tipo}
              rows={streaks[tipo]?.[cond] || []}
              sortField={sortField}
              sortDir={sortDir}
            />
          ))}
        </div>
      )}
    </div>
  );
};

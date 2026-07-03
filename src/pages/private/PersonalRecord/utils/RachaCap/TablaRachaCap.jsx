import { useState } from "react";
import { pretty } from "../../../match/utils/pretty";
import { fmtFecha, sortList, TIPO_CFG } from "./rachaCap";

export const TipoTable = ({ tipo, rows, sortField, sortDir }) => {
  const cfg = TIPO_CFG[tipo];
  const sorted = sortList(rows, sortField, sortDir);

  const [isOpen, setIsOpen] = useState(false);

  if (!sorted.length) {
    return (
      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} px-3 py-2`}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 italic">Sin rachas registradas.</p>
      </div>
    );
  }

  // cabecera col 4 según tipo
  const col4Header =
    tipo === "invictos"
      ? "G / E"
      : tipo === "ganados"
        ? "G"
        : tipo === "empatados"
          ? "E"
          : "P";

  const col4Value = (r) =>
    tipo === "invictos"
      ? `${r.g} / ${r.e}`
      : tipo === "ganados"
        ? r.g
        : tipo === "empatados"
          ? r.e
          : r.p;

  return (
    <div className={`rounded-xl border ${cfg.border} overflow-hidden w-full`}>
      {/* toggle del tipo */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 ${cfg.bg} focus:outline-none`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
          >
            {cfg.label}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {sorted.length} racha{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span
          className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {/* contenido colapsable */}
      {isOpen &&
        (sorted.length === 0 ? (
          <div className="px-3 py-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 italic">
              Sin rachas registradas.
            </p>
          </div>
        ) : (
          /* 🛠️ CORRECCIÓN 1: Forzamos ancho completo y comportamiento block para scroll fluido */
          <div className="overflow-x-auto border-t border-slate-100 w-full block scrollbar-thin">
            {/* 🛠️ CORRECCIÓN 2: Cambiamos w-max por w-full + table-fixed en móviles y auto en escritorio */}
            <table className="text-sm w-full table-fixed md:table-auto">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  {/* 🛠️ CORRECCIÓN 3: Seteamos anchos base estrictos en mobile para el contenido textual */}
                  <th className="px-2 py-2 text-left w-[130px] md:w-auto">
                    Capitán
                  </th>
                  <th className="px-2 py-2 text-center w-12">Racha</th>
                  <th className="px-2 py-2 text-center w-16">{col4Header}</th>
                  <th className="px-2 py-2 text-center w-10">GF</th>
                  <th className="px-2 py-2 text-center w-10">GC</th>
                  <th className="px-2 py-2 text-left w-[90px] md:w-auto">
                    Período
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((r, i) => (
                  <tr
                    key={`${r.captain}__${r.club}`}
                    className="hover:bg-slate-50/60"
                  >
                    <td className="px-2 py-1.5">
                      <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-medium w-4 shrink-0">
                            {i + 1}
                          </span>
                          {/* 🛠️ CORRECCIÓN 4: Truncado para evitar rotura por nombres muy extensos */}
                          <span
                            className="text-xs font-bold text-slate-800 truncate max-w-[110px] md:max-w-none"
                            title={pretty(r.captain)}
                          >
                            {pretty(r.captain)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 pl-5">
                          <span
                            className="text-[11px] font-semibold text-slate-500 truncate max-w-[100px] md:max-w-none"
                            title={pretty(r.club)}
                          >
                            {pretty(r.club)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-5">
                          {r.yearRange}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`font-black text-base ${cfg.racha}`}>
                        {r.racha}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-slate-700">
                      {col4Value(r)}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold text-emerald-700">
                      {r.gf}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold text-rose-700">
                      {r.gc}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex flex-col leading-tight text-[11px] text-slate-500">
                        <span>{fmtFecha(r.fechaInicio)}</span>
                        <span>{fmtFecha(r.fechaFin)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
};

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
    <div className={`rounded-xl border ${cfg.border} overflow-hidden`}>
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
          <div className="overflow-x-auto border-t border-slate-100 max-w-full">
            <table className="text-sm w-max">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-2 py-2 text-left">Capitán</th>

                  <th className="px-2 py-2 text-center">Racha</th>
                  <th className="px-2 py-2 text-center">{col4Header}</th>
                  <th className="px-2 py-2 text-center">GF</th>
                  <th className="px-2 py-2 text-center">GC</th>
                  <th className="px-2 py-2 text-left">Período</th>
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
                          <span className="text-xs font-bold text-slate-800">
                            {pretty(r.captain)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 pl-5">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {pretty(r.club)}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 ml-4">
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
                      <div className="flex flex-col leading-tight text-xs text-slate-500">
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

// Empatados.jsx
import React, { useState } from "react";
import { useLineups } from "../../../../../context/LineUpProvider";
import { useRachas } from "../Hooks/UseRachas"; // Ajustá esta ruta según tu estructura
import { descomponerFecha, formatearFecha } from "../Hooks/formatearFechas";
import { ordenarRachas } from "../ordenarRachas";

const Empatados = ({ sortKey, sortDirection }) => {
  const { state: lineupState } = useLineups();
  const lineups = lineupState?.lineups ?? {};

  // 1. Traemos las rachas de empates usando el hook unificado para las 4 condiciones (Corregido "neutral")
  const { empatados: rEmpatadasGeneral } = useRachas(lineups);
  const { empatados: rEmpatadasLocal } = useRachas(lineups, {
    condition: "local",
  });
  const { empatados: rEmpatadasVisitante } = useRachas(lineups, {
    condition: "visitante",
  });
  const { empatados: rEmpatadasNeutral } = useRachas(lineups, {
    condition: "neutral",
  });

  // 2. Inicializamos en null para que arranquen TODAS cerradas en el celular
  const [columnaAbierta, setColumnaAbierta] = useState(null);

  // Al hacer clic, si tocás la misma que está abierta, pasa a null (se cierra)
  const toggleColumna = (id) => {
    setColumnaAbierta(columnaAbierta === id ? null : id);
  };

  const renderColumna = (
    titulo,
    colorBorder,
    textColor,
    listaRachas,
    idKey,
  ) => {
    const listaOrdenada = ordenarRachas(listaRachas, sortKey, sortDirection);
    const isOpen = columnaAbierta === idKey;

    return (
      <div className="flex flex-col bg-slate-50/50 p-2 rounded-2xl border border-slate-100 transition-all duration-200">
        {/* Encabezado clickable en móviles (Anulado en PC mediante pointer-events-none) */}
        <button
          type="button"
          onClick={() => toggleColumna(idKey)}
          className={`w-full flex items-center justify-between text-left border-b-2 ${colorBorder} pb-2 mb-1 pointer-events-auto lg:pointer-events-none focus:outline-none`}
        >
          <div className="flex flex-col min-w-0 pr-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider truncate">
              {titulo}
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              {listaOrdenada.length}{" "}
              {listaOrdenada.length === 1 ? "Racha" : "Rachas"}
            </span>
          </div>

          {/* Flecha indicadora: Solo visible en móviles */}
          <span
            className={`text-slate-400 text-[10px] transition-transform duration-200 block lg:hidden shrink-0 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </button>

        {/* Contenedor colapsable: hidden/block en celular, block permanente en PC (lg:block) */}
        <div
          className={`transition-all duration-200 lg:block ${
            isOpen ? "block mt-2" : "hidden"
          }`}
        >
          {listaOrdenada.length === 0 ? (
            <p className="text-[11px] font-medium text-slate-400 italic py-2 px-1">
              Sin rachas.
            </p>
          ) : (
            /* Cards en dos columnas por fila en celulares, 1 columna vertical en PC */
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {listaOrdenada.map((item, index) => {
                const inicio = descomponerFecha(item.fechaInicio);
                const fin = descomponerFecha(item.fechaFin);
                return (
                  <div
                    key={`${idKey}-${item.club}-${index}`}
                    className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-slate-300"
                  >
                    {/* 1er renglón: Copa, Nombre del club y partidos empatados */}
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">
                        🤝 {item.club}
                      </h4>
                      <span
                        className={`text-xl font-black ${textColor} tracking-tight shrink-0`}
                      >
                        {item.rachaEmpates}{" "}
                      </span>
                    </div>

                    {/* Línea sutil de separación interna */}
                    <div className="border-t border-slate-100 my-1.5"></div>

                    {/* 2do renglón: Rango de fechas simple unificado en una sola línea */}
                    <div className="text-[12px] font-bold text-slate-500 text-center tracking-tight mt-auto">
                      <span>{inicio.dia} / </span>
                      <span className="text-indigo-600 font-black">
                        {inicio.mes}
                      </span>
                      <span> / {inicio.anio}</span>
                      <br />
                      <span>{fin.dia} / </span>
                      <span className="text-cyan-600 font-black">
                        {fin.mes}
                      </span>
                      <span> / {fin.anio}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 max-w-full mx-auto space-y-2">
      {/* Encabezado de sección */}
      <div className="flex flex-col items-start border-l-4 border-amber-500 pl-4 py-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          Rachas de Empates
        </h2>     
      </div>

      {/* Grid General del Panel (1 col en cel, 2 en tablets, 4 en monitores grandes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {renderColumna(
          "General",
          "border-amber-500",
          "text-amber-500",
          rEmpatadasGeneral,
          "gen",
        )}
        {renderColumna(
          "Local",
          "border-sky-500",
          "text-sky-600",
          rEmpatadasLocal,
          "loc",
        )}
        {renderColumna(
          "Visitante",
          "border-indigo-500",
          "text-indigo-600",
          rEmpatadasVisitante,
          "vis",
        )}
        {renderColumna(
          "Neutral",
          "border-emerald-500",
          "text-emerald-600",
          rEmpatadasNeutral,
          "neu",
        )}
      </div>
    </div>
  );
};

export default Empatados;

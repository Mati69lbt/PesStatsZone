// Perdidos.jsx
import React, { useState } from "react";
import { useLineups } from "../../../../../context/LineUpProvider";
import { useRachas } from "../Hooks/UseRachas"; // Ajustá esta ruta según tu estructura
import { formatearFecha } from "../Hooks/formatearFechas";

const Perdidos = () => {
  const { state: lineupState } = useLineups();
  const lineups = lineupState?.lineups ?? {};

  // 1. Traemos las rachas de derrotas usando el hook unificado para las 4 condiciones (Corregido "neutral")
  const { perdidos: rPerdidasGeneral } = useRachas(lineups);
  const { perdidos: rPerdidasLocal } = useRachas(lineups, {
    condition: "local",
  });
  const { perdidos: rPerdidasVisitante } = useRachas(lineups, {
    condition: "visitante",
  });
  const { perdidos: rPerdidasNeutral } = useRachas(lineups, {
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
              {listaRachas.length}{" "}
              {listaRachas.length === 1 ? "Racha" : "Rachas"}
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
          {listaRachas.length === 0 ? (
            <p className="text-[11px] font-medium text-slate-400 italic py-2 px-1">
              Sin rachas.
            </p>
          ) : (
            /* Cards en dos columnas por fila en celulares, 1 columna vertical en PC */
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {listaRachas.map((item, index) => (
                <div
                  key={`${idKey}-${item.club}-${index}`}
                  className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-slate-300"
                >
                  {/* 1er renglón: Alerta, Nombre del club y partidos perdidos seguidos */}
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">
                      ⚠️ {item.club}
                    </h4>
                    <span
                      className={`text-sm font-black ${textColor} tracking-tight shrink-0`}
                    >
                      {item.rachaDerrotas}{" "}
                      <span className="text-[9px] font-bold text-slate-400">
                        PJ
                      </span>
                    </span>
                  </div>

                  {/* Línea sutil de separación interna */}
                  <div className="border-t border-slate-100 my-1.5"></div>

                  {/* 2do renglón: Rango de fechas simple unificado en una sola línea */}
                  <div className="text-[9px] font-bold text-slate-500 text-center tracking-tight">
                    <span>{formatearFecha(item.fechaInicio)}</span>
                    <span className="mx-1 text-slate-300 font-normal">-</span>
                    <span>{formatearFecha(item.fechaFin)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 max-w-full mx-auto space-y-4">
      {/* Encabezado de sección */}
      <div className="flex flex-col items-start border-l-4 border-rose-500 pl-4 py-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          Rachas de Derrotas
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Historial de caídas consecutivas dividido por condición (ganar o
          empatar cortan la racha)
        </span>
      </div>

      {/* Grid General del Panel (1 col en cel, 2 en tablets, 4 en monitores grandes de PC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {renderColumna(
          "General",
          "border-rose-500",
          "text-rose-600",
          rPerdidasGeneral,
          "gen",
        )}
        {renderColumna(
          "Local",
          "border-sky-500",
          "text-sky-600",
          rPerdidasLocal,
          "loc",
        )}
        {renderColumna(
          "Visitante",
          "border-indigo-500",
          "text-indigo-600",
          rPerdidasVisitante,
          "vis",
        )}
        {renderColumna(
          "Neutral",
          "border-amber-500",
          "text-amber-500",
          rPerdidasNeutral,
          "neu",
        )}
      </div>
    </div>
  );
};

export default Perdidos;

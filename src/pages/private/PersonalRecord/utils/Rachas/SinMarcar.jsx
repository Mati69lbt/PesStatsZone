// SinMarcar.jsx
import React, { useState } from "react";
import { useLineups } from "../../../../../context/LineUpProvider";
import { useGoles } from "../Hooks/useGoles"; // Ajustá esta ruta según tus carpetas
import { descomponerFecha, formatearFecha } from "../Hooks/formatearFechas";
import { ordenarRachas } from "../ordenarRachas";

const SinMarcar = ({ sortKey, sortDirection }) => {
  const { state: lineupState } = useLineups();
  const lineups = lineupState?.lineups ?? {};

  // 1. Traemos las rachas sin marcar goles con el hook para las 4 condiciones
  const { sinMarcar: rSinMarcarGeneral } = useGoles(lineups);
  const { sinMarcar: rSinMarcarLocal } = useGoles(lineups, {
    condition: "local",
  });
  const { sinMarcar: rSinMarcarVisitante } = useGoles(lineups, {
    condition: "visitante",
  });
  const { sinMarcar: rSinMarcarNeutral } = useGoles(lineups, {
    condition: "neutral",
  });

  // 2. Control del acordeón móvil (Cerradas por defecto)
  const [columnaAbierta, setColumnaAbierta] = useState(null);

  const toggleColumna = (id) => {
    setColumnaAbierta(columnaAbierta === id ? null : id);
  };

  const renderColumna = (titulo, colorBorder, listaRachas, idKey) => {
    const listaOrdenada = ordenarRachas(listaRachas, sortKey, sortDirection);
    const isOpen = columnaAbierta === idKey;

    return (
      <div className="flex flex-col bg-slate-50/50 p-2 rounded-2xl border border-slate-100 transition-all duration-200">
        {/* Encabezado accionable móvil */}
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

          <span
            className={`text-slate-400 text-[10px] transition-transform duration-200 block lg:hidden shrink-0 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </button>

        {/* Contenedor de Tarjetas */}
        <div
          className={`transition-all duration-200 lg:block ${isOpen ? "block mt-2" : "hidden"}`}
        >
          {listaOrdenada.length === 0 ? (
            <p className="text-[11px] font-medium text-slate-400 italic py-2 px-1">
              Sin rachas de sequía.
            </p>
          ) : (
            /* Layout: 2 columnas por fila en celulares, 1 columna en monitores */
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {listaOrdenada.map((item, index) => {
                const inicio = descomponerFecha(item.fechaInicio);
                const fin = descomponerFecha(item.fechaFin);
                return (
                  <div
                    key={`${idKey}-${item.club}-${index}`}
                    className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-slate-300 flex flex-col justify-between"
                  >
                    {/* 1er renglón: Distribución simétrica */}
                    <div className="flex items-center justify-between gap-1 w-full min-h-[32px]">
                      {/* BLOQUE 1 (Izquierda): Club multilínea si es largo */}
                      <div className="flex items-center gap-0.5 max-w-[42%] leading-tight">
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight  antialiased">
                          ⚽ {item.club}
                        </h4>
                      </div>

                      {/* BLOQUE 2 (Centro): Partidos Seguidos Sin Marcar con badge gris/rojo sutil */}
                      <div className="flex justify-center shrink-0">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black tracking-tight shadow-2xs">
                          {item.racha}
                          <span className="text-[8px] font-bold opacity-75">
                            PJ
                          </span>
                        </span>
                      </div>

                      {/* BLOQUE 3 (Derecha): Indicador de Sequía (Goles a Favor en 0) */}
                    </div>

                    {/* Línea de separación */}
                    <div className="border-t border-slate-100 my-1.5"></div>

                    {/* 2do renglón: Fechas */}
                    <div className="text-[12px] font-bold text-slate-500 text-center tracking-tight mt-auto">
                      <span>{inicio.dia} / </span>
                      <span className="text-cyan-600 font-black">
                        {inicio.mes}
                      </span>
                      <span> / {inicio.anio}</span>
                      <br />
                      <span>{fin.dia} / </span>
                      <span className="text-fuchsia-600 font-black">
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
      {/* Encabezado */}
      <div className="flex flex-col items-start border-l-4 border-slate-500 pl-4 py-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          Partidos Seguidos Sin Marcar
        </h2>
      </div>

      {/* Grid General de 4 Columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {renderColumna("General", "border-slate-500", rSinMarcarGeneral, "gen")}
        {renderColumna("Local", "border-sky-500", rSinMarcarLocal, "loc")}
        {renderColumna(
          "Visitante",
          "border-indigo-500",
          rSinMarcarVisitante,
          "vis",
        )}
        {renderColumna("Neutral", "border-amber-400", rSinMarcarNeutral, "neu")}
      </div>
    </div>
  );
};

export default SinMarcar;

// Favor.jsx
import React, { useState } from "react";
import { useLineups } from "../../../../../context/LineUpProvider";
import { useGoles } from "../Hooks/useGoles"; // Ajustá esta ruta según tu estructura
import { formatearFecha } from "../Hooks/formatearFechas";

const Favor = () => {
  const { state: lineupState } = useLineups();
  const lineups = lineupState?.lineups ?? {};

  // 1. Traemos las rachas anotando goles con el hook unificado para las 4 condiciones
  const { anotando: rAnotandoGeneral } = useGoles(lineups);
  const { anotando: rAnotandoLocal } = useGoles(lineups, {
    condition: "local",
  });
  const { anotando: rAnotandoVisitante } = useGoles(lineups, {
    condition: "visitante",
  });
  const { anotando: rAnotandoNeutral } = useGoles(lineups, {
    condition: "neutral",
  });

  // 2. Inicializamos en null para que arranquen todas cerradas en móviles
  const [columnaAbierta, setColumnaAbierta] = useState(null);

  const toggleColumna = (id) => {
    setColumnaAbierta(columnaAbierta === id ? null : id);
  };

  const renderColumna = (titulo, colorBorder, listaRachas, idKey) => {
    const isOpen = columnaAbierta === idKey;

    return (
      <div className="flex flex-col bg-slate-50/50 p-2 rounded-2xl border border-slate-100 transition-all duration-200">
        {/* Encabezado accionable en móviles */}
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

          {/* Flecha indicadora móvil */}
          <span
            className={`text-slate-400 text-[10px] transition-transform duration-200 block lg:hidden shrink-0 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </button>

        {/* Contenedor colapsable */}
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
                  className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-slate-300 flex flex-col justify-between"
                >
                  {/* 1er renglón: 3 bloques distribuidos simétricamente */}
                  <div className="flex items-center justify-between gap-1 w-full min-h-[32px]">
                    {/* BLOQUE 1 (Izquierda): Club multilinea si es muy largo */}
                    <div className="flex items-center gap-0.5 max-w-[42%] leading-tight">
                      <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight break-words antialiased">
                        ⚽ {item.club}
                      </h4>
                    </div>

                    {/* BLOQUE 2 (Centro): Partidos Seguidos anotando con badge celeste */}
                    <div className="flex justify-center shrink-0">
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 text-xs font-black tracking-tight shadow-2xs">
                        {item.racha}
                        <span className="text-[8px] font-bold opacity-75">
                          PJ
                        </span>
                      </span>
                    </div>

                    {/* BLOQUE 3 (Derecha): Goles acumulados en total durante la racha */}
                    <div className="flex flex-col items-center shrink-0 justify-end max-w-[35%]">
                      <span className="text-[7px] font-bold text-slate-400 uppercase leading-none">
                        Goles
                      </span>
                      <span className="text-[11px] font-black text-emerald-600 leading-tight">
                        +{item.acumulados}
                      </span>
                    </div>
                  </div>

                  {/* Línea sutil de separación interna */}
                  <div className="border-t border-slate-100 my-1.5"></div>

                  {/* 2do renglón: Rango de fechas unificado */}
                  <div className="text-[9px] font-bold text-slate-500 text-center tracking-tight mt-auto">
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
      <div className="flex flex-col items-start border-l-4 border-emerald-500 pl-4 py-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          Partidos Seguidos Anotando
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Historial de partidos consecutivos convirtiendo goles (quedarse en 0
          corta la racha)
        </span>
      </div>

      {/* Grid General del Panel (1 col en cel, 2 en tablets, 4 en PC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {renderColumna(
          "General",
          "border-emerald-500",
          rAnotandoGeneral,
          "gen",
        )}
        {renderColumna("Local", "border-sky-500", rAnotandoLocal, "loc")}
        {renderColumna(
          "Visitante",
          "border-indigo-500",
          rAnotandoVisitante,
          "vis",
        )}
        {renderColumna("Neutral", "border-amber-500", rAnotandoNeutral, "neu")}
      </div>
    </div>
  );
};

export default Favor;

import React, { useState } from "react";
import { useLineups } from "../../../../../context/LineUpProvider";
import { useRachas } from "../Hooks/UseRachas";
import { descomponerFecha, formatearFecha } from "../Hooks/formatearFechas";
import { ordenarRachas } from "../ordenarRachas";

const Invictos = ({ sortKey, sortDirection }) => {
  const { state: lineupState } = useLineups();
  const lineups = lineupState?.lineups ?? {};

  // 1. Hook unificado para las 4 condiciones
  const { invictos: rInvictasGeneral } = useRachas(lineups);
  const { invictos: rInvictasLocal } = useRachas(lineups, {
    condition: "local",
  });
  const { invictos: rInvictasVisitante } = useRachas(lineups, {
    condition: "visitante",
  });
  const { invictos: rInvictasNeutral } = useRachas(lineups, {
    condition: "neutro",
  });

  // 2. Estado para controlar qué columna está expandida en móviles (por defecto 'gen')
  const [columnaAbierta, setColumnaAbierta] = useState(null);

  const toggleColumna = (id) => {
    setColumnaAbierta(id);
  };

  const renderColumna = (titulo, colorBorder, listaRachas, idKey) => {
    const listaOrdenada = ordenarRachas(listaRachas, sortKey, sortDirection);
    const isOpen = columnaAbierta === idKey;

    return (
      <div className="flex flex-col bg-slate-50/50 p-3 rounded-2xl border border-slate-100 transition-all duration-200">
        {/* Encabezado clickable en móviles */}
        <button
          type="button"
          onClick={() => toggleColumna(idKey)}
          className={`w-full flex items-center justify-between text-left border-b-2 ${colorBorder} pb-2 mb-1 pointer-events-auto lg:pointer-events-none focus:outline-none`}
        >
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
              {titulo}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {listaOrdenada.length}{" "}
              {listaOrdenada.length === 1 ? "Racha" : "Rachas"}
            </span>
          </div>

          {/* Flecha indicadora: solo visible en celular/tablet (oculta en pantallas lg) */}
          <span
            className={`text-slate-400 text-xs transition-transform duration-200 block lg:hidden ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </button>

        {/* Contenedor de las tarjetas con colapso dinámico */}
        <div
          className={`transition-all duration-200 lg:block ${
            isOpen ? "block mt-2" : "hidden"
          }`}
        >
          {listaOrdenada.length === 0 ? (
            <p className="text-xs font-medium text-slate-400 italic py-2 px-1">
              Sin rachas registradas.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {listaOrdenada.map((item, index) => {
                const inicio = descomponerFecha(item.fechaInicio);
                const fin = descomponerFecha(item.fechaFin);
                console.log("item", item);

                return (
                  <div
                    key={`${idKey}-${item.club}-${index}`}
                    className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-slate-300 flex flex-col gap-2"
                  >
                    {/* RENGILÓN 1: CLUB (Izquierda) y PJ (Derecha) */}
                    <div className="flex items-center justify-between gap-2 w-full ">
                      {/* Nombre del Club - Ahora tiene más espacio del lado izquierdo */}
                      <div className="flex items-center leading-tight max-w-[70%]">
                        <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight break-words antialiased">
                          ⚽ {item.club}
                        </h4>
                      </div>

                      {/* Partidos Jugados (PJ) - Alineado a la derecha */}
                      <div className="flex justify-end shrink-0">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 text-xs font-black tracking-tight shadow-2xs">
                          {item.rachaInvicta}
                          <span className="text-[12px] font-bold opacity-75">
                            PJ
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Divisor del medio horizontal */}
                    <div className="border-t border-slate-300 my-0.5"></div>

                    {/* RENGLÓN 2: FECHAS (Izquierda) y ESTADÍSTICAS G/E (Derecha) */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      {/* Fechas de Inicio y Fin - Alineadas a la izquierda y con texto justificado al inicio */}
                      <div className="text-[11px] font-bold text-slate-500 text-left tracking-tight leading-normal">
                        <div>
                          <span>{inicio.dia} / </span>
                          <span className="text-sky-600 font-black">
                            {inicio.mes}
                          </span>
                          <span> / {inicio.anio}</span>
                        </div>
                        <div>
                          <span>{fin.dia} / </span>
                          <span className="text-rose-600 font-black">
                            {fin.mes}
                          </span>
                          <span> / {fin.anio}</span>
                        </div>
                      </div>

                      {/* Estadísticas de Ganados (G) y Empatados (E) - Alineadas a la derecha */}
                      <div className="flex gap-2 text-right shrink-0 justify-end">
                        <div className="flex flex-col items-center">
                          <span className="text-[12px] font-bold text-slate-400 uppercase leading-none">
                            G
                          </span>
                          <span className="text-[12px] font-black text-emerald-600 leading-tight">
                            {item.ganados}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[12px] font-bold text-slate-400 uppercase leading-none">
                            E
                          </span>
                          <span className="text-[12px] font-black text-amber-500 leading-tight">
                            {item.empatados}
                          </span>
                        </div>
                      </div>
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
      {/* Encabezado General del Componente */}
      <div className="flex flex-col items-start border-l-4 border-sky-500 pl-4 py-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          Rachas Históricas Invictas
        </h2>
      </div>

      {/* Grid Contenedor de las 4 Columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {renderColumna("General", "border-sky-500", rInvictasGeneral, "gen")}
        {renderColumna("Local", "border-emerald-500", rInvictasLocal, "loc")}
        {renderColumna(
          "Visitante",
          "border-indigo-500",
          rInvictasVisitante,
          "vis",
        )}
        {renderColumna("Neutral", "border-amber-500", rInvictasNeutral, "neu")}
      </div>
    </div>
  );
};

export default Invictos;

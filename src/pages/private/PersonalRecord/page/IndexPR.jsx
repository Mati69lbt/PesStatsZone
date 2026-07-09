import React, { useState } from "react";
import Palmares from "../../versus/palmares/page/Palmares";
import PersonRecord from "./PersonRecord";
import AllGoleadores from "./AllGoleadores";
import Calendario from "./Calendario";
import Rachas from "./Rachas";
import Gol from "./Gol";
import GolVersus from "./GolVersus";
import RachasCapitanes from "./RachasCapitanes";
import Rivales from "./Rivales";

const IndexPR = () => {
  const [view, setView] = useState("palmares");

  const opcionesMenu = [
    { id: "palmares", label: "🏆 Palmarés" },
    { id: "record", label: "📊 Récord Personal" },
    { id: "goleadores", label: "⚽ Goleadores" },
    { id: "versus", label: "⚔️ Versus" },
    { id: "calendario", label: "📅 Calendario" },
    { id: "rachas", label: "🔥 Rachas Históricas" },
    { id: "gol", label: "🎯 Goles Detallados" },
    { id: "golversus", label: "🏟️ Rachas de Capitanes" },
    { id: "rivales", label: "🛡️ Rivales" },
  ];

  return (
    <div className="p-2 md:p-4 w-full mx-auto space-y-2">
      {/* CONTENEDOR DEL SELECT (Centrado y ajustado al contenido con w-max) */}
      <div className="flex justify-center py-2">
        <div className="relative w-max mx-auto">
          {" "}
          {/* 👈 CAMBIO: w-max acá para que el contenedor abrace al select */}
          {/* Etiqueta flotante superior al estilo UltimosDiez */}
          <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-sky-600 z-10 whitespace-nowrap">
            Sección del Panel
          </label>
          {/* Le agregamos un padding derecho extra (pr-10) para que la flecha no tape el texto del emoji */}
          <select
            className="w-max rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer appearance-none"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            {opcionesMenu.map((opt) => (
              <option
                key={opt.id}
                value={opt.id}
                className="font-semibold text-slate-800"
              >
                {opt.label}
              </option>
            ))}
          </select>
          {/* Flechita personalizada a la derecha perfectamente alineada al borde del w-max */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Línea divisoria */}
      <hr className="border-slate-400 w-full b-2" />

      {/* Contenido dinámico inferior intacto */}
      <div className="mt-2">
        {view === "palmares" && <Palmares />}
        {view === "record" && <PersonRecord />}
        {view === "goleadores" && <AllGoleadores />}
        {view === "versus" && <GolVersus />}
        {view === "calendario" && <Calendario />}
        {view === "rachas" && <Rachas />}
        {view === "gol" && <Gol />}
        {view === "golversus" && <RachasCapitanes />}
        {view === "rivales" && <Rivales />}
      </div>
    </div>
  );
};

export default IndexPR;

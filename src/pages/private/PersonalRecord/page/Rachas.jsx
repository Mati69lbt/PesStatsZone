import React, { useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { useRachasInvictas } from "../utils/UseRacahsInvictas";
import { formatearFecha } from "../utils/Hooks/formatearFechas";
import Invictos from "../utils/Rachas/Invictos";
import Ganados from "../utils/Rachas/Ganados";
import Empatados from "../utils/Rachas/Empatados";
import Perdidos from "../utils/Rachas/Perdidos";

const Rachas = () => {
  const [view, setView] = useState("invictos");

  const [sortKey, setSortKey] = useState("racha");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  return (
    <div>
     
      <div className="m-2 md:mx-0 p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-center gap-3">
        {/* 1. SELECT: TIPO DE RACHA */}
        <div className="relative w-max">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold uppercase tracking-wider text-sky-600 z-10 whitespace-nowrap">
            Tipo de Racha
          </label>
          <select
            className="w-max rounded-xl border border-slate-200 bg-white pl-3 pr-9 py-2 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer appearance-none"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="invictos" className="font-semibold text-slate-800">
              🛡️ Invictos
            </option>
            <option value="ganados" className="font-semibold text-slate-800">
              🟢 Victorias
            </option>
            <option value="empatados" className="font-semibold text-slate-800">
              🟡 Empatados
            </option>
            <option value="perdidos" className="font-semibold text-slate-800">
              🔴 Perdidos
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* 2. SELECT: CRITERIO DE ORDENAMIENTO */}
        <div className="relative w-max">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold uppercase tracking-wider text-slate-600 z-10 whitespace-nowrap">
            Ordenar por
          </label>
          <select
            className="w-max rounded-xl border border-slate-200 bg-white pl-3 pr-9 py-2 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer appearance-none"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="alfabetico" className="font-semibold text-slate-800">
              🔤 Club
            </option>
            <option value="racha" className="font-semibold text-slate-800">
              🔥 Racha
            </option>
            <option value="fecha" className="font-semibold text-slate-800">
              📅 Últma Fecha
            </option>
            <option value="ganados" className="font-semibold text-slate-800">
              🟢 Ganados
            </option>
            <option value="empatados" className="font-semibold text-slate-800">
              🟡 Empatados
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* 3. BOTÓN: DIRECCIÓN DE ORDEN */}
        <button
          type="button"
          onClick={() =>
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="h-[34px] px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1"
          title={
            sortDirection === "asc" ? "Orden Ascendente" : "Orden Descendente"
          }
        >
          <span className="text-xs font-bold font-mono">
            {sortDirection === "asc" ? "🔼 ASC" : "🔽 DES"}
          </span>
        </button>
      </div>

      <div>
        {view === "invictos" && (
          <Invictos sortKey={sortKey} sortDirection={sortDirection} />
        )}
        {view === "ganados" && (
          <Ganados sortKey={sortKey} sortDirection={sortDirection} />
        )}
        {view === "empatados" && (
          <Empatados sortKey={sortKey} sortDirection={sortDirection} />
        )}
        {view === "perdidos" && (
          <Perdidos sortKey={sortKey} sortDirection={sortDirection} />
        )}
      </div>
    </div>
  );
};

export default Rachas;

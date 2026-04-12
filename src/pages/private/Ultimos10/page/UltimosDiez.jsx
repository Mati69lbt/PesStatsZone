import React, { useEffect, useState } from "react";
import Ultimos10Resultados from "../../temporada/page/Ultimos10Resultados";
import usePartidosLegacy from "../../temporada/hooks/usePartidosLegacy";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import { Navigate } from "react-router-dom";
import { pretty } from "../../match/utils/pretty";

const UltimosDiez = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);

  const clubs = Object.keys(lineupState?.lineups || {});
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || "",
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;

  const clubData = lineupState?.lineups?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0;
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;

  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }

  useEffect(() => {
    if (!selectedClub && clubs.length) {
      setSelectedClub(lineupState?.activeClub || clubs[0]);
    }
  }, [clubs, lineupState?.activeClub, selectedClub]);

  if (!clubs.length) {
    return (
      <p className="text-center text-slate-500 mt-4">Cargando clubes...</p>
    );
  }

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];
  const partidosLegacy = usePartidosLegacy(matches);
  return (
    <div className="p-2 max-w-5xl mx-auto">
      <div className="flex items-center justify-evenly gap-4 mb-4 mt-2 px-1">
        {/* BLOQUE IZQUIERDO: Título con personalidad */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-[0.85]">
            Últimos 10
          </h1>
          <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 border border-amber-200 shadow-sm">
            <span className="text-[10px]">🔥</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Racha
            </span>
          </div>
        </div>

        {/* BLOQUE DERECHO: Selector Estilizado */}
        <div className="flex flex-col items-start flex-1 max-w-[180px]">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 pr-1">
            Club
          </span>
          <div className="relative w-full">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              disabled={clubs.length <= 1}
              className="appearance-none w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm font-bold text-slate-700 shadow-sm 
                   transition-all cursor-pointer
                   hover:border-slate-300 hover:bg-slate-50
                   focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900
                   disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {clubs.map((c) => (
                <option key={c} value={c}>
                  {pretty(c)}
                </option>
              ))}
            </select>
            {/* Icono de flechita personalizado */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Ultimos10Resultados partidos={partidosLegacy} />
    </div>
  );
};

export default UltimosDiez;

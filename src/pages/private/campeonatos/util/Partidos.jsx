import { useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { usePartido } from "../../../../context/PartidoReducer";
import useAuth from "../../../../hooks/useAuth";
import { fetchUserData, useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import CampDesgl from "./CampDesgl";
import { pretty } from "../../match/utils/pretty";

const Partidos = () => {
  const { uid } = useAuth();
  const { dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  // carga de data (mismo patrón que Campeonatos)
  useUserData(uid, matchDispatch, lineupDispatch);

  const refreshData = async () => {
    if (!uid) return;
    await fetchUserData(uid, matchDispatch, lineupDispatch);
  };

  const clubs = Object.keys(lineupState?.lineups || {});
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || "",
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;
  const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];
  const torneosConfig = bucket?.torneosConfig || {};

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      <div className="flex items-start justify-evenly mb-1 px-2 border-b border-slate-100 pb-2">
        {/* BLOQUE IZQUIERDO: Selector de Club */}
        <div className="flex flex-col items-start w-full max-w-[180px]">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1.5 pl-1">
            Club
          </span>
          <div className="relative w-full">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              disabled={clubs.length <= 1}
              className="appearance-none w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm font-bold text-slate-700 shadow-sm 
                   transition-all cursor-pointer hover:border-slate-300 hover:bg-slate-50
                   focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900
                   disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {clubs.map((c) => (
                <option key={c} value={c}>
                  {pretty(c)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* BLOQUE DERECHO: Título Vertical "Evelin Style" */}
        <div className="flex flex-col items-start text-right">
          <span className="text-2xl mb-0.5">📋</span>
          <h2 className="text-lg md:text-xl font-black tracking-tighter text-slate-900 leading-none">
            Detalle de Partidos
          </h2>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Por Campeonato
          </span>
        </div>
      </div>

      <CampDesgl
        matches={matches}
        clubKey={clubKey}
        uid={uid}
        onRefresh={refreshData}
        torneosConfig={torneosConfig}
      />
    </div>
  );
};

export default Partidos;

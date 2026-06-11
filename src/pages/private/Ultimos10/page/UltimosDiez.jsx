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
      <div className="flex items-center justify-evenly gap-4 mb-2 mt-2 px-1">
        {/* BLOQUE IZQUIERDO: Título con personalidad */}
        <div className="relative flex flex-col pt-2 ">
          {" "}
          {/* pt-2 para que el badge no se corte arriba */}
          {/* Badge Flotante */}
          <div className="absolute -top-1 left-0 flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 border border-amber-100 shadow-sm z-10 scale-90 origin-left ">
            <span className="text-[10px] ">🔥</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Racha
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none mt-3">
            Últimos 10
          </h1>
        </div>

        {/* BLOQUE DERECHO: Selector Estilizado */}
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wide text-sky-600 z-10">
            Club
          </label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 font-semibold text-slate-700"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {pretty(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Ultimos10Resultados partidos={partidosLegacy} />
    </div>
  );
};

export default UltimosDiez;

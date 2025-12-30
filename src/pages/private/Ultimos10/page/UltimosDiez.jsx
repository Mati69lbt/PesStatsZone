import React, { useEffect, useState } from "react";
import Ultimos10Resultados from "../../temporada/page/Ultimos10Resultados";
import usePartidosLegacy from "../../temporada/hooks/usePartidosLegacy";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import { Navigate } from "react-router-dom";

function colorResultado(p) {
  const gf = parseInt(p.golesFavor) || 0;
  const gc = parseInt(p.golesContra) || 0;
  if (gf > gc) return "bg-green-400";
  if (gf === gc) return "bg-yellow-400";
  return "bg-red-400";
}


const UltimosDiez = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);

  const clubs = Object.keys(lineupState?.lineups || {});
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || ""
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
      <div className="flex items-center justify-between gap-1 mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex flex-col gap-0 leading-none">
          <span>Últimos 10</span>
          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            🔥 Racha
          </span>
        </h1>

        <label className="w-full max-w-[220px]">
          <span className="text-sm font-medium text-slate-700">Club</span>

          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            disabled={clubs.length <= 1}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800 shadow-sm
      focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
      disabled:bg-slate-100 disabled:text-slate-500"
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Ultimos10Resultados partidos={partidosLegacy} />
    </div>
  );
};

export default UltimosDiez;

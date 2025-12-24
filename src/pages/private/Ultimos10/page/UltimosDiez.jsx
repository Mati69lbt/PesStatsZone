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

const Titulo = ({ children }) => (
  <h2 className="font-semibold text-sm whitespace-nowrap col-start-1">
    {children}
  </h2>
);
const Bolitas = ({ lista }) => (
  <div className="flex gap-1 flex-wrap col-start-2 -ml-20">
    {lista.map((p) => (
      <div
        key={p.id}
        className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${colorResultado(p)}`}
        title={`${p.fecha} vs ${String(p.rival || "").trim()}: ${
          p.golesFavor
        }-${p.golesContra}`}
      />
    ))}
  </div>
);

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
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];
  const partidosLegacy = usePartidosLegacy(matches);
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Últimos 10
          <span className="ml-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            🔥 racha
          </span>
        </h1>

        {clubs.length > 1 && (
          <select
            className="border p-2 rounded text-sm"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      <Ultimos10Resultados partidos={partidosLegacy} />
    </div>
  );
};

export default UltimosDiez;

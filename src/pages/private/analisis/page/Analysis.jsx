import React, { useEffect, useMemo, useState } from "react";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import useAuth from "../../../../hooks/useAuth";
import { buildBreakdown, emptyRow, emptyTriple } from "../utils/funtions";
import StatsTable from "../utils/StatsTable";
import { pretty } from "../../match/utils/pretty";
import { Navigate, useNavigate } from "react-router-dom";

const Analysis = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);

  const clubs = Object.keys(lineupState?.lineups || []);
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || ""
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];

 

  const clubData = lineupState?.lineups?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0;
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;

  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }


  const { captains, tournamentsOrdered } = useMemo(
    () => buildBreakdown(matches),
    [matches]
  );

  const toRows = (triple) => ({
    General: triple?.General || emptyRow(),
    Local: triple?.Local || emptyRow(),
    Visitante: triple?.Visitante || emptyRow(),
    Neutral: triple?.Neutral || emptyRow(),
  });

  const visibleClub = selectedClub;
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-3 items-center mb-4">
        <h1 className="text-2xl font-bold text-center col-start-2">
          📊 Análisis
        </h1>
        {clubs.length > 1 && (
          <div className="justify-self-end flex items-center gap-2">
            <span className="text-sm text-gray-600">Club:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={visibleClub}
              onChange={(e) => setSelectedClub(e.target.value)}
            >
              {clubs.map((c) => (
                <option key={c} value={c}>
                  {pretty(c)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Totales Generales: todas las tarjetitas de capitanes en UNA fila */}
      <h2 className="text-lg font-bold mb-2 text-center underline">
        Totales Generales
      </h2>

      <div className="overflow-x-auto">
        <div className="flex gap-3 flex-nowrap justify-center mx-auto w-max">
          {captains.map((cap) => (
            <div
              key={`total-${cap.captain}`}
              className="min-w-[260px] sm:min-w-[280px] lg:min-w-[320px]"
            >
              <StatsTable title={cap.captain} rows={toRows(cap.total)} />
            </div>
          ))}
          {!captains.length && (
            <div className="text-gray-500 text-sm">— Sin partidos —</div>
          )}
        </div>
      </div>

      {/* Por campeonato: sección por torneo (recientes primero), en cada una TODAS las tarjetitas */}
      <div className="mt-6 space-y-6">
        {tournamentsOrdered.map((tName) => (
          <section key={tName}>
            <h3 className="font-bold text-base md:text-lg mb-2 text-center underline">
              {tName}
            </h3>
            <div className="overflow-x-auto">
              <div className="flex gap-3 flex-nowrap justify-center mx-auto w-max">
                {captains.map((cap) => {
                  const triple = cap.byTournament[tName] || emptyTriple();
                  return (
                    <div
                      key={`${tName}-${cap.captain}`}
                      className="min-w-[260px] sm:min-w-[280px] lg:min-w-[320px]"
                    >
                      <StatsTable title={cap.captain} rows={toRows(triple)} />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Analysis;

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

  const clubs = Object.keys(lineupState?.lineups || {});
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || "",
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

  const torneosConfig = data?.torneosConfig || {};

  const { captains, tournamentsOrdered } = useMemo(
    () => buildBreakdown(matches, torneosConfig),
    [matches, data?.torneosConfig],
  );

  const toRows = (triple) => ({
    General: triple?.General || emptyRow(),
    Local: triple?.Local || emptyRow(),
    Visitante: triple?.Visitante || emptyRow(),
    Neutral: triple?.Neutral || emptyRow(),
  });

  const visibleClub = selectedClub;

  const captainsVisible = captains.filter(
    (cap) => (cap?.total?.General?.pj ?? 0) > 0,
  );

  return (
    <div className="p-2 max-w-7xl mx-auto">
      <div className="flex items-center justify-evenly gap-1 mb-2 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex flex-col gap-0 leading-none">
          <span>📊 Análisis</span>
          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            🔎 Resumen
          </span>
        </h1>

        <label className="w-full max-w-[220px]">
          <span className="text-sm font-medium text-slate-700">Club</span>

          <select
            value={visibleClub} // o selectedClub (pero que sea el mismo state que usás en Análisis)
            onChange={(e) => setSelectedClub(e.target.value)}
            disabled={clubs.length <= 1}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800 shadow-sm
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-slate-100 disabled:text-slate-500"
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {pretty(c)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-extrabold tracking-wide text-slate-800 uppercase">
            Totales Generales
          </h2>
          <span className="text-xs text-slate-500">
            {captainsVisible.length
              ? `${captainsVisible.length} capitanes`
              : "—"}
          </span>
        </div>

        <div className="p-2">
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-3 mx-auto w-max sm:flex-row sm:flex-nowrap sm:justify-center">
              {captainsVisible.map((cap) => (
                <div
                  key={`total-${cap.captain}`}
                  className="min-w-[260px] sm:min-w-[280px] lg:min-w-[320px]"
                >
                  <StatsTable title={cap.captain} rows={toRows(cap.total)} />
                </div>
              ))}
              {!captainsVisible.length && (
                <div className="text-slate-500 text-sm px-2 py-4">
                  — Sin partidos —
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Por campeonato: sección por torneo (recientes primero), en cada una TODAS las tarjetitas */}
      <div className="mt-2 space-y-6 ">
        {tournamentsOrdered.map((tName) => (
          <section
            key={tName}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="px-2 py-2 border-b border-slate-200">
              <h3 className="text-sm font-extrabold tracking-wide text-slate-800 uppercase text-center">
                {tName}
              </h3>
            </div>

            <div className="p-2">
              <div className="overflow-x-auto">
                <div className="flex flex-col gap-3 mx-auto w-max sm:flex-row sm:flex-nowrap sm:justify-center">
                  {captainsVisible.map((cap) => {
                    const triple = cap.byTournament[tName] || emptyTriple();
                    if ((triple?.General?.pj ?? 0) === 0) return null;
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
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Analysis;

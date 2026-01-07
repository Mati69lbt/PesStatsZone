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
    <div className="p-2 max-w-7xl mx-auto">
      <div className="mb-2 grid grid-cols-1 gap-2 items-center sm:grid-cols-3">
        {/* Columna izquierda: spacer solo en sm+ */}
        <div className="hidden sm:block" />

        {/* Título */}
        <h1 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          📊 Análisis
          <span className="ml-2 sm:ml-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] sm:text-xs font-semibold text-slate-600">
            por torneo y capitán
          </span>
        </h1>

        {/* Selector club */}
        {clubs.length > 1 ? (
          <div className="flex items-center justify-center gap-2 sm:justify-self-end sm:justify-end">
            <span className="text-sm text-slate-600">Club:</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
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
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-extrabold tracking-wide text-slate-800 uppercase">
            Totales Generales
          </h2>
          <span className="text-xs text-slate-500">
            {captains.length ? `${captains.length} capitanes` : "—"}
          </span>
        </div>

        <div className="p-2">
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-3 mx-auto w-max sm:flex-row sm:flex-nowrap sm:justify-center">
              {captains.map((cap) => (
                <div
                  key={`total-${cap.captain}`}
                  className="min-w-[260px] sm:min-w-[280px] lg:min-w-[320px]"
                >
                  <StatsTable title={cap.captain} rows={toRows(cap.total)} />
                </div>
              ))}
              {!captains.length && (
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
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Analysis;

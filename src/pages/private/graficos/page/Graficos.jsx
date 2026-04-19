import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import { Navigate } from "react-router-dom";
import { pretty } from "../../match/utils/pretty";
import { useConsoleDownloader } from "../../../../components/useConsoleDownloader";
import { usePointsChartData } from "../hooks/usePointsChartData";
import PointsLineChart from "../components/PointsLineChart";
import BreakdownFilters from "../components/BreakdownFilters";
import SegmentedTabs from "../components/SegmentedTabs";

const Graficos = () => {
  const { downloadLogs } = useConsoleDownloader();
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
  const torneosConfig = data?.torneosConfig || {};

  const clubData = lineupState?.lineups?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0;
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;

  // UI states
  const [view, setView] = useState("general");
  const [breakdown, setBreakdown] = useState("all"); // all | year | tournament
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }

  const visibleClub = selectedClub;



  const { years, tournaments, chartData, yMax, captainA, captainB } =
    usePointsChartData(matches, {
      view,
      breakdown,
      selectedYear,
      selectedTournament,
      torneosConfig,
    });

  return (
    <div className="p-2 max-w-7xl mx-auto">
      {" "}
      <div className="flex flex-row items-center justify-evenly gap-4 m-2">
        {/* Título a la izquierda */}
        <h1 className="text-left text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
          📈 Gráficos 📉
        </h1>

        {/* Selector a la derecha */}
        {clubs.length > 1 && (
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wide text-sky-600 z-10">
              Club
            </label>
            <select
              className="w-full sm:w-max rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 font-semibold text-slate-700 cursor-pointer"
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
        )}
      </div>
      <div className="mt-4 space-y-3">
        <SegmentedTabs value={view} onChange={setView} />

        <BreakdownFilters
          breakdown={breakdown}
          setBreakdown={(v) => {
            setBreakdown(v);
            setSelectedYear(null);
            setSelectedTournament(null);
          }}
          years={years}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          tournaments={tournaments}
          selectedTournament={selectedTournament}
          setSelectedTournament={setSelectedTournament}
        />

        <PointsLineChart chartData={chartData} yMax={yMax} />
      </div>
    </div>
  );
};

export default Graficos;

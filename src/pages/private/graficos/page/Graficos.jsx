import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import { Navigate } from "react-router-dom";
import { pretty } from "../../match/utils/pretty";
import Extras from "../components/Extras";
import GraficosOld from "../components/GraficosOld";
import EntreClubs from "../components/EntreClubs"; // 👈 nuevo

const VIEWS = [
  { key: "extras", label: "📊 Extras" },
  { key: "general", label: "📈 General" },
  { key: "entreClubs", label: "🆚 Entre Clubs" },
];

const Graficos = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [viewOne, setViewOne] = useState("extras");
  const [data, setData] = useState(null);

  const lineupsObj = lineupState?.lineups || {};
  const clubs = Object.keys(lineupsObj);

  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || "",
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupsObj?.[clubKey] : null;

  useEffect(() => {
    if (!bucket || Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];
  const torneosConfig = data?.torneosConfig || {};

  const clubData = lineupsObj?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0;
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;

  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }

  // El selector de club solo aplica a Extras y General
  const showClubSelector = viewOne !== "entreClubs" && clubs.length > 1;

  return (
    <div className="p-2 w-full max-w-5xl mx-auto">
      {/* ── header ── */}
      <div className="flex flex-row items-center justify-evenly gap-4 m-2">
        <h1 className="text-left text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
          📈 Gráficos 📉
        </h1>

        {showClubSelector && (
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

      {/* ── botones de vista ── */}
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        {VIEWS.map((v) => {
          const active = viewOne === v.key;
          // ocultar "Entre Clubs" si solo hay 1 club
          if (v.key === "entreClubs" && clubs.length < 2) return null;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => setViewOne(v.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                active
                  ? "bg-sky-600 text-white border-sky-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* ── contenido ── */}
      <div className="mt-2">
        {viewOne === "extras" && (
          <Extras matches={matches} torneosConfig={torneosConfig} />
        )}
        {viewOne === "general" && (
          <GraficosOld matches={matches} torneosConfig={torneosConfig} />
        )}
        {viewOne === "entreClubs" && <EntreClubs lineupsObj={lineupsObj} />}
      </div>
    </div>
  );
};

export default Graficos;

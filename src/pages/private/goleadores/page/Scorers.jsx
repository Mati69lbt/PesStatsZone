import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import GoleadoresPorCampeonato from "../utils/GoleadoresPorCampeonato";
import GoleadoresGral from "../utils/GoleadoresGral";
import Villanos from "../utils/Villanos";
import Expulsados from "../utils/Expulsados";
import Carniceros from "../utils/Carniceros";
import { Navigate } from "react-router-dom";
import TopGoleadores from "../../temporada/page/Goleadores";
import RachaN from "../utils/RachaN";
import Goleadores_Desglozados from "../utils/goleadores_Desglozados/page/Goleadores_Desglozados";
import GolEuropa from "../utils/GolEuropa";

const getSeasonKeyFromMatch = (m) => {
  const raw = m?.fecha || m?.createdAt;
  if (raw) {
    const d =
      typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ? new Date(`${raw}T00:00:00`)
        : new Date(raw);

    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const month = d.getMonth() + 1;
      return month >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
    }
  }
  return null;
};

const prettySafe = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const Scorers = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);

  const clubs = Object.keys(lineupState?.lineups || []);
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
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];

  const [view, setView] = useState("scorers"); // 'goleadores' | 'campeonatos' | 'villanos'

  const years = Array.from(
    new Set(
      matches
        .map((m) => m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio)
        .filter((y) => y !== undefined && y !== null)
        .map(String),
    ),
  ).sort();

  const seasons = Array.from(
    new Set(matches.map(getSeasonKeyFromMatch).filter(Boolean)),
  ).sort((a, b) => parseInt(b.slice(0, 4), 10) - parseInt(a.slice(0, 4), 10));

  const viewOptions = [
    { value: "scorers", label: "Scorers" },
    { value: "campeonatos", label: "Campeonato" },
    { value: "año", label: "Año" },
    { value: "europa", label: "Año Europeo" },
    { value: "racha", label: "Rachas de Sequía Goleadora" },
    { value: "villanos", label: "Villanos" },
    { value: "carniceros", label: "Carniceros" },
    { value: "expulsados", label: "Expulsados" },
    { value: "goleadores", label: "Goleadores" },
  ];

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      {/* Selector de club */}
      <h1 className="text-center text-3xl mt-2 ">⚽ Scorers</h1>
      <div className="mb-1 flex items-end justify-center gap-2">
        {/* Club */}
        <label className="w-[220px]">
          <span className="text-sm font-medium text-slate-700">Club</span>

          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {prettySafe(c)}
              </option>
            ))}
          </select>
        </label>

        {/* Vista */}
        <label className="w-[220px]">
          <span className="text-sm font-medium text-slate-700">Vista</span>

          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {viewOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Contenido según vista */}
      {view === "scorers" && <Goleadores_Desglozados matches={matches} />}
      {view === "goleadores" && <GoleadoresGral matches={matches} />}
      {view === "campeonatos" && (
        <GoleadoresPorCampeonato matches={matches} bucket={bucket} />
      )}
      {view === "europa" && (
        <div className="flex flex-col gap-4">
          {seasons.map((s) => (
            <GolEuropa
              key={s}
              mode="vertical"
              topN={15}
              years={[s]} // temporada "2023-2024"
              data={data}
              showHomeAway
            />
          ))}
        </div>
      )}
      {view === "villanos" && <Villanos matches={matches} />}
      {view === "expulsados" && <Expulsados matches={matches} />}
      {view === "carniceros" && <Carniceros matches={matches} />}
      {view === "racha" && <RachaN data={data} />}
      {view === "año" && (
        <div className="flex flex-col gap-4">
          {years
            .slice()
            .sort((a, b) => b - a) // ✅ más reciente arriba
            .map((y) => (
              <TopGoleadores
                key={y}
                mode="vertical"
                topN={15}
                years={[y]} // ✅ 1 año por bloque
                data={data}
                showHomeAway
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default Scorers;

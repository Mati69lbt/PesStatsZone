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
import PartidosJugados from "../utils/goleadores_Desglozados/page/PartidosJugados";
import EstaAnual from "../../temporada/page/EstaAnual";

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

  const allMatchesFromAllClubs = React.useMemo(() => {
    const lineups = lineupState?.lineups || {};
    return Object.values(lineups).flatMap((club) =>
      Array.isArray(club.matches) ? club.matches : [],
    );
  }, [lineupState]);

  const years = Array.from(
    new Set(
      allMatchesFromAllClubs // <-- Cambiar aquí
        .map((m) => m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio)
        .filter((y) => y !== undefined && y !== null)
        .map(String),
    ),
  ).sort((a, b) => b - a);

  const seasons = Array.from(
    new Set(allMatchesFromAllClubs.map(getSeasonKeyFromMatch).filter(Boolean)),
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
    { value: "jugados", label: "Partidos Jugados" },
    { value: "estAnuales", label: "Est Anuales" },
    { value: "estEuro", label: "Est Euro" },
  ];

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      {/* Selector de club */}
      <div className="flex items-center justify-evenly mb-2 mt-2 px-2 border-b border-slate-100 pb-2">
        {/* GRUPO DE SELECTORES (Lado izquierdo - Uno arriba del otro) */}
        <div className="flex flex-col gap-4">
          {/* Selector de Club */}
          <div className="relative w-[160px]">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
              Club
            </label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="appearance-none w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm font-bold text-slate-700 shadow-sm 
                   transition-all cursor-pointer hover:border-sky-200
                   focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
            >
              {clubs.map((c) => (
                <option key={c} value={c}>
                  {prettySafe(c)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Selector de Vista */}
          <div className="relative w-[140px]">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
              Vista
            </label>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="appearance-none w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm font-bold text-slate-700 shadow-sm 
                   transition-all cursor-pointer hover:border-sky-200
                   focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
            >
              {viewOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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

        {/* TÍTULO (Lado derecho) */}
        <div className="flex flex-col items-end self-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
              Scorers
            </h1>
            <span className="text-xl">⚽</span>
          </div>
          <div className="h-1.5 w-12 bg-sky-500 rounded-full mt-2"></div>
        </div>
      </div>

      {/* Contenido según vista */}
      {view === "scorers" && <Goleadores_Desglozados matches={matches} />}
      {view === "jugados" && <PartidosJugados matches={matches} />}
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
              all={{ matches: allMatchesFromAllClubs }}
            />
          ))}
        </div>
      )}
      {view === "villanos" && <Villanos matches={matches} />}
      {view === "expulsados" && <Expulsados matches={matches} />}
      {view === "carniceros" && <Carniceros matches={matches} />}
      {view === "racha" && <RachaN data={data} />}
      {view === "estAnuales" && (
        <EstaAnual all={{ matches: allMatchesFromAllClubs }} />
      )}
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
                all={{ matches: allMatchesFromAllClubs }}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default Scorers;

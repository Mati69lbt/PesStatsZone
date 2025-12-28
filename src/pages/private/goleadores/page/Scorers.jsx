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

  const [view, setView] = useState("goleadores"); // 'goleadores' | 'campeonatos' | 'villanos'

  const years = Array.from(
    new Set(
      matches
        .map((m) => m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio)
        .filter((y) => y !== undefined && y !== null)
        .map(String)
    )
  ).sort();

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      {/* Selector de club */}
      <h1 className="text-center text-3xl mt-2 ">⚽ Scorers</h1>
      <div className="flex items-center justify-center gap-2 m-3">
        <label className="text-sm font-medium block">Club</label>
        <select
          className="border p-1 rounded text-sm"
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
        >
          {clubs.map((c) => (
            <option key={c} value={c}>
              {prettySafe(c)}
            </option>
          ))}
        </select>
      </div>

      {/* Botones de vista */}
      <div className="grid grid-cols-3 gap-2 mb-4 md:flex md:flex-wrap md:justify-center">
        <button
          onClick={() => setView("goleadores")}
          className={`px-3 py-1.5 rounded-full text-sm md:text-sm border transition ${
            view === "goleadores"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Goleadores
        </button>
        <button
          onClick={() => setView("campeonatos")}
          className={`px-3 py-1.5 rounded-full text-sm md:text-sm border transition ${
            view === "campeonatos"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Campeonato
        </button>
        <button
          onClick={() => setView("año")}
          className={`px-3 py-1.5 rounded-full text-sm md:text-sm border transition ${
            view === "año"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Año
        </button>
        <button
          onClick={() => setView("expulsados")}
          className={`px-3 py-1.5 rounded-full text-sm md:text-sm border transition ${
            view === "expulsados"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Expulsados
        </button>
        <button
          onClick={() => setView("villanos")}
          className={`px-3 py-1.5 rounded-full text-sm md:text-sm border transition ${
            view === "villanos"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Villanos
        </button>
        <button
          onClick={() => setView("carniceros")}
          className={`px-3 py-1.5 rounded-full text-sm md:text-sm border transition ${
            view === "carniceros"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Carniceros
        </button>
      </div>
      <div className="text-center">
        <button
          onClick={() => setView("racha")}
          className={`px-3 py-1.5 rounded-full w-max  text-sm md:text-sm border transition ${
            view === "racha"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Rachas de Sequía Goleadora
        </button>
      </div>
      {/* Contenido según vista */}
      {view === "goleadores" && <GoleadoresGral matches={matches} />}
      {view === "campeonatos" && <GoleadoresPorCampeonato matches={matches} />}
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

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

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];

  const [view, setView] = useState("goleadores"); // 'goleadores' | 'campeonatos' | 'villanos'

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      {/* Selector de club */}
      <div className="flex flex-wrap gap-4 mb-4 items-end justify-center">
        <div className="text-center">
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
      </div>

      {/* Botones de vista */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          onClick={() => setView("goleadores")}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${
            view === "goleadores"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Goleadores
        </button>
        <button
          onClick={() => setView("campeonatos")}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${
            view === "campeonatos"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Goleadores por campeonato
        </button>
        <button
          onClick={() => setView("expulsados")}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${
            view === "expulsados"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Expulsados
        </button>
        <button
          onClick={() => setView("villanos")}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${
            view === "villanos"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Villanos
        </button>
        <button
          onClick={() => setView("carniceros")}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${
            view === "carniceros"
              ? "bg-blue-600 text-white border-blue-700 shadow"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Carniceros
        </button>
      </div>

      {/* Contenido según vista */}
      {view === "goleadores" && <GoleadoresGral matches={matches} />}
      {view === "campeonatos" && <GoleadoresPorCampeonato matches={matches} />}
      {view === "villanos" && <Villanos matches={matches} />}
      {view === "expulsados" && <Expulsados matches={matches} />}
      {view === "carniceros" && <Carniceros matches={matches} />}
    </div>
  );
};

export default Scorers;

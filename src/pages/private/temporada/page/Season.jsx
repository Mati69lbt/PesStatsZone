import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { Navigate } from "react-router-dom";
import SeasonBlock from "../hooks/SeasonBlock";
import Blocks from "../hooks/Blocks";
import useResumenTemporada from "../hooks/useResumenTemporada";
import usePartidosLegacy from "../hooks/usePartidosLegacy";
import { normalizeName } from "../../../../utils/normalizeName";
import SeasonEurope from "./SeasonEurope";

const Season = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);
  const [view, setView] = useState("anual");

  const lineups = lineupState?.lineups || {};
  const blocks = Blocks(lineups);

  const clubKeys = Object.keys(lineups);

  const anyConfigured = clubKeys.some((ck) => {
    const cd = lineups?.[ck] || {};
    const hasPlayers = (cd.players?.length ?? 0) > 0;
    const hasFormations = (cd.formations?.length ?? 0) > 0;
    const hasPlayerStats = cd.playersStats
      ? Object.keys(cd.playersStats).length > 0
      : false;
    return hasPlayers || hasFormations || hasPlayerStats;
  });

  if (!anyConfigured) return <Navigate to="/formacion" replace />;

  const matches = Array.isArray(data?.matches) ? data.matches : [];

  // Resumen por temporada
  const { temporadasOrdenadas, resumenPorTemporada, captainsOrdenados } =
    useResumenTemporada(matches);

  // Ordenar temporadas de la más reciente a la más vieja
  const temporadasDesc = [...(temporadasOrdenadas || [])].sort((a, b) => {
    const yearsA = String(a).match(/\d{4}/g) || [];
    const yearsB = String(b).match(/\d{4}/g) || [];

    const keyA = yearsA.length ? Math.max(...yearsA.map(Number)) : -Infinity;
    const keyB = yearsB.length ? Math.max(...yearsB.map(Number)) : -Infinity;

    return keyB - keyA; // más reciente primero
  });

  const pick = (obj, keys) =>
    keys.reduce((acc, k) => (obj?.[k] ? { ...acc, [k]: obj[k] } : acc), {});

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-center">📆 Temporadas</h1>

        <div className="mt-3 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setView("anual")}
            className={[
              "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
              view === "anual"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            Anual
          </button>

          <button
            type="button"
            onClick={() => setView("europeo")}
            className={[
              "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
              view === "europeo"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            Europeo
          </button>
        </div>
      </div>
      <hr className="border-gray-200" />

      {view === "anual" &&
        blocks.map((b) => (
          <SeasonBlock
            key={`${b.year}-${b.clubKey}`}
            clubKey={b.clubKey}
            bucket={b.bucket}
            year={b.year}
            matchesForYear={b.matchesForYear}
          />
        ))}
      {view === "europeo" && <SeasonEurope lineups={lineups} />}
    </div>
  );
};

export default Season;

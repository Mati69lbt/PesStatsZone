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

const Season = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);



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
      </div>

      {blocks.map((b) => (
        <SeasonBlock
          key={`${b.year}-${b.clubKey}`}
          clubKey={b.clubKey}
          bucket={b.bucket}
          year={b.year}
          matchesForYear={b.matchesForYear}
        />
      ))}
    </div>
  );
};

export default Season;

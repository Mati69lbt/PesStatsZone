import React, { useMemo, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { Navigate } from "react-router-dom";
import { CondAccordion } from "../utils/RachaCap/Acordion";
import { buildStreaks, MIN_RACHA } from "../utils/RachaCap/rachaCap";

const RachasCapitanes = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const hasData = Object.keys(lineupState?.lineups || {}).length > 0;

  const allMatches = useMemo(
    () =>
      Object.values(lineupState?.lineups || {}).flatMap((club) =>
        Array.isArray(club.matches) ? club.matches : [],
      ),
    [lineupState],
  );

  const streaks = useMemo(() => buildStreaks(allMatches), [allMatches]);

  if (!hasData) return <Navigate to="/formacion" replace />;

  return (
    <div className="p-2 max-w-max mx-auto">
      <div className="flex flex-col items-start border-l-4 border-sky-500 pl-4 py-1 mb-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          Rachas de Capitanes
        </h2>
        <span className="text-xs text-slate-500 mt-0.5">
          Mínimo {MIN_RACHA} partidos consecutivos · racha más larga por capitán
        </span>
      </div>

      <div className="space-y-3">
        {["General", "Local", "Visitante", "Neutral"].map((cond) => (
          <CondAccordion key={cond} cond={cond} streaks={streaks} />
        ))}
      </div>
    </div>
  );
};

export default RachasCapitanes;

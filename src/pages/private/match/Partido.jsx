// cspell: ignore Notiflix firestore notiflix estadisticas trin formacion falci
import React, { useEffect, useState } from "react";
import { usePartido } from "../../../context/PartidoReducer";
import { useLineups } from "../../../context/LineUpProvider";
import useAuth from "../../../hooks/useAuth";
import { useUserData } from "../../../hooks/useUserData";
import FechaInput from "./inputs/FechaInput";
import RivalInput from "./inputs/RivalInput";
import TorneoInput from "./inputs/TorneoInput";
import CaptainSelect from "./inputs/CaptainSelect";
import SubstitutesInput from "./inputs/SubstitutesInput ";
import { makeHandleChange } from "./utils/handleChange";
import { pretty } from "./utils/pretty";
import { makeHandleOnBlur } from "./utils/handleOnBlur";
import makeHandleChangeCaptainSelect from "./utils/handleChangeCaptainSelect";
import GuardarPartidoButton from "./button/GuardarPartidoButton";
import { Navigate, useNavigate } from "react-router-dom";
import handleSaveMatch from "./utils/handleSaveMatch";
import ConditionInput from "./inputs/ConditionInput";
import makeHandleChangeSubstitutes from "./utils/handleChangeSubstitutes";
import GoleadoresActiveClub from "./inputs/GoleadoresActiveClub";
import GoleadoresRivales from "./inputs/GoleadoresRivales";
import Resumen from "./inputs/Resumen";
import useActiveClub from "./hook/useActiveClub";
import { normalizeName } from "../../../utils/normalizeName";

// lc0001
// lc@gmail.com lc

// trinche@gmail.com
// trin001  martin

// mito@gmail.com
// mito001

// Falcioni@gmail.com
// falci001

const Partido = () => {
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { uid } = useAuth();
  const { state: lineupState } = useLineups();
  const { activeClub, lineups } = lineupState;

  const navigate = useNavigate();
  const handleChange = makeHandleChange(matchDispatch);
  const handleChangeCaptainSelect = makeHandleChangeCaptainSelect(
    lineups,
    activeClub,
    matchDispatch
  );
  const handleChangeSubstitutes = makeHandleChangeSubstitutes(matchDispatch);

  useUserData(uid, matchDispatch);
  useActiveClub({ activeClub, matchState, matchDispatch });

  const rawClub = lineupState?.activeClub || matchState?.activeClub || "";
  const clubKey = normalizeName ? normalizeName(rawClub) : rawClub;
  const clubData = lineupState?.lineups?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0; 
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;
  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Registrar Partido</h1>
      <form className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <span className="text-lg font-bold text-blue-700">
            {matchState.activeClub
              ? pretty(matchState.activeClub)
              : "Esperando Nombre del Club"}
          </span>
        </div>
        <FechaInput value={matchState.fecha} onChange={handleChange} />
        <RivalInput
          value={matchState.rival}
          onChange={handleChange}
          onBlur={makeHandleOnBlur(
            matchDispatch,
            "rival",
            "El campo Rival es Obligatorio"
          )}
          suggestions={matchState.rivalesIndex}
        />
        <TorneoInput
          value={matchState.torneoName}
          onChange={handleChange}
          suggestions={matchState.torneosIndex}
          onBlur={makeHandleOnBlur(
            matchDispatch,
            "torneoName",
            "El campo Torneo es Obligatorio"
          )}
        />
        <ConditionInput value={matchState.condition} onChange={handleChange} />
        <CaptainSelect
          disabled={matchState.substitutes.length > 0}
          formations={lineups?.[activeClub]?.formations || []}
          value={matchState.captain}
          onChange={handleChangeCaptainSelect}
        />
        <SubstitutesInput
          disabled={!matchState.captain}
          players={lineups?.[activeClub]?.players || []}
          value={matchState.substitutes}
          onChange={handleChangeSubstitutes}
          starters={matchState.starters}
          substitutes={matchState.substitutes}
        />
        <GoleadoresActiveClub
          state={matchState}
          dispatch={matchDispatch}
          disabled={!matchState.captain}
        />
        <GoleadoresRivales
          state={matchState}
          dispatch={matchDispatch}
          disabled={!matchState.rival}
        />
        <Resumen state={matchState} activeClub={matchState.activeClub} />
        <GuardarPartidoButton
          disabled={
            !uid ||
            !matchState.fecha ||
            !matchState.rival ||
            !matchState.torneoName ||
            !matchState.condition
          }
          onClick={(e) => {
            e.preventDefault();
            handleSaveMatch({
              uid,
              matchState,
              activeClub,
              matchDispatch,
              navigate,
            });
          }}
        />
      </form>
    </div>
  );
};

export default Partido;

// cspell: ignore Notiflix lenght notiflix firestore tocá
import React, { useState } from "react";
import useForm from "../../../../hooks/useForm";
import useAuth from "../../../../hooks/useAuth";
import { useLineupsData } from "../../../../hooks/useLineupsData";
import useSaveClub from "../hooks/useSaveClub";
import useSetTeamName from "../hooks/useSetTeamName";
import useUpdateLineup from "../hooks/useUpdateLineup";
import useResetClubOnUidChange from "../hooks/useResetClubOnUidChange";
import HeaderTeam from "../components/HeaderTeam";
import InputTeamName from "../components/InputTeamName";
import InputNewPlayer from "../components/InputNewPlayer";
import PlayersLists from "../components/PlayersLists";
import { useLineups } from "../../../../context/LineUpProvider";
import usePartitionPlayers from "../hooks/usePartitionPlayers";
import bucket from "../util/bucket";
import { confirmClubSave, saveActiveOnBlur } from "../util/teamNameHandlers";
import SelectCaptain from "../components/SelectCaptain";
import SelectStarters from "../components/SelectStarters";
import StartersList from "../components/StartersList";
import Formations from "../components/Formations";
import useClubSuggestions from "../hooks/useClubSuggestions";
import loadClubOnBlur from "../util/loadClubOnBlur";
import { normalizeName } from "../../../../utils/normalizeName";

const TeamForm = () => {
  const { form, changed, setValue } = useForm();
  const { uid } = useAuth();

  const [teamName, setTeamName] = useState(form.teamName || "");

  const { state: lineupState, dispatch } = useLineups();
  const {
    captainName = "",
    activeClub = "",
    starters = [],
    selectMode = "captain",
    selectedOption = "",
    lineups = {},
    players = [],
  } = lineupState ?? {};

  const clubKey = normalizeName(activeClub || "");
  const clubPlayers = lineups?.[clubKey]?.players || [];

  const [showForm, setShowForm] = useState(false);

  const hydrated = useLineupsData(
    uid,
    dispatch,
    lineupState.activeClub,
    lineupState.managedClubs
  );

  useSaveClub(lineups, activeClub, dispatch, hydrated);

  useSetTeamName(activeClub, lineups, setTeamName);

  const ordered = bucket(lineups, activeClub);

  const { remaining, chosen } = usePartitionPlayers(clubPlayers, starters);

  useUpdateLineup(uid, activeClub, lineups, clubPlayers);
  useResetClubOnUidChange(uid, dispatch);

  const clubSuggestions = useClubSuggestions(
    lineupState?.managedClubs,
    lineups
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Columna 1: Header  Club  Jugadores  Nueva formación */}
        <div className="space-y-2">
          <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
            <HeaderTeam teamName={teamName} />

            <InputTeamName
              value={teamName}
              onChange={setTeamName}
              onBlurSave={() =>
                loadClubOnBlur({ uid, teamName, lineups, dispatch })
              }
              onConfirm={() =>
                confirmClubSave({ uid, teamName, lineups, dispatch })
              }
              disabled={clubPlayers.length > 0}
              suggestions={clubSuggestions}
            />

            <InputNewPlayer
              activeClub={activeClub}
              lineups={lineups}
              form={form}
              changed={changed}
              players={clubPlayers}
              dispatch={dispatch}
              setValue={setValue}
            />

            <PlayersLists
              players={clubPlayers}
              selectedOption={selectedOption}
              dispatch={dispatch}
              teamName={teamName}
              activeClub={activeClub}
              uid={uid}
              setShowForm={setShowForm} // ← aquí vive el botón "Nueva formación"
            />
          </div>
        </div>

        {/* Columna 2: SelectCaptain  SelectStarters  StartersList (solo si showForm) */}
        <div className="space-y-2">
          {showForm ? (
            <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
              <>
                <SelectCaptain
                  showForm={showForm}
                  selectMode={selectMode}
                  players={clubPlayers}
                  selectedOption={selectedOption}
                  starters={starters}
                  dispatch={dispatch}
                />

                {selectMode === "starters" && clubPlayers.length > 0 && (
                  <SelectStarters
                    selectedOption={selectedOption}
                    players={clubPlayers}
                    starters={starters}
                    dispatch={dispatch}
                    remaining={remaining}
                    chosen={chosen}
                  />
                )}

                <StartersList
                  captainName={captainName}
                  players={clubPlayers}
                  starters={starters}
                  dispatch={dispatch}
                  activeClub={activeClub}
                  teamName={teamName}
                  uid={uid}
                  setShowForm={setShowForm}
                />
              </>
            </div>
          ) : // Placeholder ligero cuando no hay formulario abierto (solo desktop)
          clubPlayers.length !== 0 ? (
            <div className="hidden md:block text-xs text-gray-500">
              Tocá <strong>Nueva formación</strong> para empezar a armar el
              equipo.
            </div>
          ) : null}
        </div>

        {/* Columna 3: Formations */}
        <div className="space-y-2">
          {ordered.length > 0 && (
            <div className="bg-white shadow-md rounded-xl p-6">
              <Formations
                ordered={ordered}
                activeClub={activeClub}
                teamName={teamName}
                uid={uid}
                dispatch={dispatch}
                setShowForm={setShowForm}
                setTeamName={setTeamName}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamForm;

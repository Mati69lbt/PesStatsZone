// cspell: ignore Notiflix notiflix Armá
import React from "react";
import handleSelectedOption from "../util/handleSelectedOption";
import { LINEUP_SET_SELECTED } from "../../../../context/LineUpProvider";
import { pretty } from "../../match/utils/pretty";

const SelectCaptain = ({
  showForm,
  selectMode,
  players = [],
  selectedOption = "",
  starters = [],
  dispatch,
}) => {
  const hasFormCaptain =
    showForm &&
    selectMode === "captain" &&
    Array.isArray(players) &&
    players.length > 0;
  if (!hasFormCaptain) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        Armá tu Formación Inicial
      </h1>

      <select
        value={selectedOption}
        onChange={(e) =>
          dispatch({
            type: LINEUP_SET_SELECTED,
            payload: e.target.value,
          })
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSelectedOption(selectedOption, players, starters, dispatch);
          }
        }}
        className="border w-full"
        disabled={!Array.isArray(players) || players.length === 0}
      >
        <option value="">Seleccionar Capitán</option>
        {[...(Array.isArray(players) ? players : [])]
          .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
          .map((player) => (
            <option key={player} value={player}>
              {pretty(player)}
            </option>
          ))}
      </select>

      <button
        type="button"
        onClick={() =>
          handleSelectedOption(selectedOption, players, starters, dispatch)
        }
        className="bg-blue-500 text-white rounded w-full p-2 mt-2"
        disabled={
          !Array.isArray(players) || players.length === 0 || !selectedOption
        }
      >
        Confirmar Capitán
      </button>
    </div>
  );
};

export default SelectCaptain;

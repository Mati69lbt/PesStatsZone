import React from "react";
import { LINEUP_SET_SELECTED } from "../../../../context/LineUpProvider";
import { pretty } from "../../match/utils/pretty";
import addStarterFromSelect from "../util/addStarterFromSelect";
import handleAddStarter from "../util/handleAddStarter";

const SelectStarters = ({
  selectedOption = "",
  players = [],
  starters = [],
  remaining = [],
  chosen = [],
  dispatch,
}) => {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-4 underline">
        Arma tu Formación Inicial
      </h1>
      <select
        value={selectedOption}
        onChange={(e) => {
          const val = e.target.value;
          dispatch({ type: LINEUP_SET_SELECTED, payload: val });
          const ok = addStarterFromSelect(val, starters, dispatch);
          if (ok) {
            dispatch({ type: LINEUP_SET_SELECTED, payload: "" });
          }
        }}
        className="border w-full"
        disabled={players.length === 0 || starters.length >= 11}
      >
        <option value="">Elegí un titular</option>

        {[...remaining].map((player) => (
          <option key={player} value={player}>
            {pretty(player)}
          </option>
        ))}

        <option disabled value="">
          — Ya elegidos —
        </option>

        {chosen.map((player) => (
          <option key={player} value={player} disabled>
            {pretty(player)}
          </option>
        ))}
      </select>
      <button
        type="button"
         onClick={() => {
          const ok = handleAddStarter(selectedOption, starters, dispatch);
          if (ok) {
            dispatch({ type: LINEUP_SET_SELECTED, payload: "" });
          }
        }}
        className="bg-blue-500 text-white rounded w-full p-2 mt-2"
        disabled={starters.length >= 11 || selectedOption === ""}
      >
        Agregar Jugador Titular
      </button>
    </div>
  );
};

export default SelectStarters;

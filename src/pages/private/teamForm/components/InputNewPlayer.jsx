import React from "react";
import handleAddPlayer from "../util/handleAddPlayer";

const InputNewPlayer = ({
  form,
  changed,
  players = [],
  dispatch,
  setValue,
  activeClub,
  lineups,
}) => {
  return (
    <div>
      <label htmlFor="playerName">Jugadores</label>
      <div className="flex flex-row gap-2">
        <input
          type="text"
          name="playerName"
          id="playerName"
          value={form.playerName || ""}
          onChange={changed}
          className="w-full p-2 border rounded"
          placeholder="Añadir jugador"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddPlayer({
                name: form.playerName,
                activeClub, // viene por props
                lineups, // viene por props
                dispatch, // viene por props
                setValue,
              });
            }
          }}
        />
        <button
          type="button"
          onClick={() =>
            handleAddPlayer({
              name: form.playerName,
              activeClub, // viene por props
              lineups, // viene por props
              dispatch, // viene por props
              setValue,
            })
          }
          className="bg-blue-500 text-white  rounded"
        >
          Añadir Jugador
        </button>
      </div>
    </div>
  );
};

export default InputNewPlayer;

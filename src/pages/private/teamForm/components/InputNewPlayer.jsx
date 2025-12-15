import React, { useEffect, useState } from "react";
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
  const [localPlayerName, setLocalPlayerName] = useState(
    form?.playerName || ""
  );

  useEffect(() => {
    setLocalPlayerName(form?.playerName || "");
  }, [form?.playerName]);
  return (
    <div>
      <label htmlFor="playerName">Jugadores</label>
      <div className="flex flex-row gap-2">
        <input
          type="text"
          name="playerName"
          id="playerName"
          value={localPlayerName}
          onChange={(e) => {
            setLocalPlayerName(e.target.value);
            changed?.(e); // seguimos llamando tu useForm
          }}
          className="w-full p-2 border rounded"
          placeholder="Añadir jugador"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddPlayer({
                name: localPlayerName,
                activeClub, // viene por props
                lineups, // viene por props
                dispatch, // viene por props
                setValue,
              });
              setLocalPlayerName(""); // opcional: limpiar visual
            }
          }}
        />
        <button
          type="button"
          onClick={() =>
            handleAddPlayer({
              name: localPlayerName,
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

//cspell: ignore Notiflix notiflix
import React from "react";
import { pretty } from "../../match/utils/pretty";
import Notiflix from "notiflix";
import {
  LINEUP_SET_SELECTED,
  PLAYERS_REMOVE,
} from "../../../../context/LineUpProvider";
import newLineup from "../util/newLineup";

const PlayersLists = ({
  players = [],
  selectedOption,
  dispatch,
  teamName,
  setShowForm,
}) => {
  if (!Array.isArray(players) || players.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Jugadores añadidos</h2>
        <span className="text-sm text-gray-500">Total: {players.length}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {[...players]
          .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
          .map((player) => (
            <div
              key={player}
              className="flex items-center justify-between rounded-md bg-gray-50 border border-gray-200 px-2 py-1.5 hover:bg-gray-100"
            >
              <span
                className="truncate text-gray-800"
                title={pretty(player)} // tooltip en desktop
              >
                {pretty(player)}
              </span>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  className="md:hidden text-gray-400 hover:text-gray-600 text-sm"
                  aria-label="Ver nombre completo"
                  onClick={() => Notiflix.Notify.info(pretty(player))}
                >
                  ℹ️
                </button>

                <button
                  type="button"
                  aria-label={`Eliminar ${pretty(player)}`}
                  title="Eliminar"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    if (selectedOption === player) {
                      dispatch({
                        type: LINEUP_SET_SELECTED,
                        payload: "",
                      });
                    }
                    dispatch({
                      type: PLAYERS_REMOVE,
                      payload: { name: player },
                    });
                    Notiflix.Notify.success("Jugador eliminado");
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
      </div>
      <button
        type="button"
        onClick={() => newLineup(teamName, setShowForm, dispatch)}
        className="bg-blue-500 text-white rounded w-full p-2 mt-2"
      >
        Nueva Formación
      </button>
    </div>
  );
};

export default PlayersLists;

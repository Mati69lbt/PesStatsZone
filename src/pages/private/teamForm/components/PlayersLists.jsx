//cspell: ignore Notiflix notiflix
import React, { useState } from "react";
import { pretty } from "../../match/utils/pretty";
import Notiflix from "notiflix";
import {
  LINEUP_SET_SELECTED,
  PLAYERS_REMOVE,
} from "../../../../context/LineUpProvider";
import newLineup from "../util/newLineup";
import trash from "../../../../../public/trash.png";

const PlayersLists = ({
  players = [],
  selectedOption,
  dispatch,
  teamName,
  setShowForm,
  activeClub,
  uid,
}) => {
  if (!Array.isArray(players) || players.length === 0) return null;
  const [showRemoveControls, setShowRemoveControls] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold">Jugadores añadidos</h2>

          {/* Icono para mostrar/ocultar cruces rojas */}
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm transition
              ${
                showRemoveControls
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            aria-label={
              showRemoveControls ? "Ocultar eliminar" : "Mostrar eliminar"
            }
            title={showRemoveControls ? "Ocultar cruces" : "Mostrar cruces"}
            onClick={() => setShowRemoveControls((v) => !v)}
          >
            ✏️
          </button>
        </div>

        <span className="text-sm text-gray-500">Total: {players.length}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 md:grid-cols-9 gap-1.5">
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
                  className="md:hidden text-gray-400 hover:text-gray-600  h-6 w-6"
                  aria-label="Ver nombre completo"
                  onClick={() => Notiflix.Notify.info(pretty(player))}
                >
                  ℹ️
                </button>

                {/* ✅ La X roja sólo aparece si activás el icono */}
                {showRemoveControls && (
                  <button
                    type="button"
                    aria-label={`Eliminar ${pretty(player)}`}
                    title="Eliminar"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      Notiflix.Confirm.show(
                        "Confirmar eliminación",
                        `¿Querés eliminar a ${pretty(player)}?`,
                        "Sí, eliminar",
                        "Cancelar",
                        () => {
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
                        },
                        () => {
                          // cancelado (no hace nada)
                        },
                      );
                    }}
                  >
                    <img src={trash} alt="Borrar Jugador" className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      <button
        type="button"
        onClick={() => {
          newLineup(teamName, setShowForm, dispatch);
          Notiflix.Notify.info("Nueva formación");
        }}
        className="bg-blue-500 text-white rounded w-full p-2 mt-2"
      >
        Nueva Formación
      </button>
    </div>
  );
};

export default PlayersLists;

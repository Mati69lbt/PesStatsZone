// cspell: ignore Notiflix lenght notiflix firestore Debés Guardá
import React from "react";
import { pretty } from "../../match/utils/pretty";
import { LINEUP_REMOVE_STARTER } from "../../../../context/LineUpProvider";
import handleSaveStarters from "../util/handleSaveStarters";
import Notiflix from "notiflix";

const StartersList = ({
  captainName,
  starters = [],
  dispatch,
  activeClub,
  teamName,
  players = [],
  uid,
  setShowForm,
}) => {
  const hasCaptainBadge = Boolean(captainName);
  const hasStartersList = Array.isArray(starters) && starters.length > 0;
  return (
    <div>
      {hasCaptainBadge && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <strong>Capitán:</strong> {pretty(captainName)}
        </div>
      )}

      {hasStartersList && (
        <div>
          <h1>{`Titulares (${starters.length}/11)`}</h1>

          <ul className="list-disc pl-5 grid grid-cols-3 gap-x-6 gap-y-2 mb-2">
            {[...starters]
              .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
              .map((player) => (
                <li key={player} className="text-gray-700 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: LINEUP_REMOVE_STARTER,
                        payload: { player },
                      });
                      Notiflix.Notify.success("Jugador eliminado");
                      if (player === captainName) {
                        Notiflix.Notify.info(
                          "Capitán eliminado. Volvé a elegir un capitán."
                        );
                      }
                    }}
                    className="mr-2"
                    aria-label={`Eliminar ${pretty(player)}`}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                  <span>{pretty(player)}</span>
                </li>
              ))}
          </ul>

          <button
            className="bg-blue-500 text-white rounded w-full p-2 mt-2"
            onClick={() =>
              handleSaveStarters({
                starters,
                captainName,
                activeClub,
                teamName,
                players,
                uid,
                dispatch,
                setShowForm,
              })
            }
            disabled={starters.length !== 11 || !captainName}
          >
            Guardar Titulares
          </button>
        </div>
      )}
    </div>
  );
};

export default StartersList;

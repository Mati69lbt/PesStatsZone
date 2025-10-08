import React from "react";
import handleDelete from "../util/handleDelete";
import handleNewCLub from "../util/handleNewCLub";
import { pretty } from "../../match/utils/pretty";

const Formations = ({
  ordered = [],
  activeClub,
  teamName,
  uid,
  dispatch,
  setShowForm,
  setTeamName,
}) => {
  if (!Array.isArray(ordered) || ordered.length === 0) return null;
  return (
    <div>
      {ordered.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 space-y-2">
          <h1 className="text-xl font-semibold text-green-700 mb-2 underline">
            Formaciones
          </h1>
          {ordered.map((lineup) => {
            const base = Array.isArray(lineup.starters) ? lineup.starters : [];
            const sorted = [...base].sort((a, b) =>
              a.localeCompare(b, "es", { sensitivity: "base" })
            );
            const col1 = sorted.slice(0, 4);
            const col2 = sorted.slice(4, 8);
            const col3 = sorted.slice(8, 11);

            return (
              <div
                key={lineup.id || lineup.createdAt.toString()}
                className="space-y-2"
              >
                <div className="grid md:grid-cols-3 gap-1 md:gap-2">
                  {[col1, col2, col3].map((col, i) => (
                    <ul
                      key={i}
                      className="bg-gray-50 rounded-lg p-1 shadow-inner space-y-1"
                    >
                      {col.map((player) => (
                        <li
                          key={player}
                          className={`px-2 py-1.5 rounded text-left leading-tight ${
                            player === lineup.captain
                              ? "bg-yellow-50 border-l-4 border-yellow-400 font-medium text-yellow-900"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          {pretty(player)}
                        </li>
                      ))}

                      {i === 2 && (
                        <li className="flex justify-center items-center">
                          <button
                            type="button"
                            aria-label="Eliminar formación"
                            className="w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-lg font-bold flex items-center justify-center shadow"
                            onClick={() =>
                              handleDelete(
                                lineup,
                                activeClub,
                                teamName,
                                uid,
                                dispatch
                              )
                            }
                          >
                            ✕
                          </button>
                        </li>
                      )}
                    </ul>
                  ))}
                </div>

                <hr />
              </div>
            );
          })}
          <button
            className="bg-blue-500 text-white rounded w-full p-2"
            onClick={() => handleNewCLub(setShowForm, dispatch, setTeamName)}
          >
            Nuevo Club para Dirigir
          </button>
        </div>
      )}
    </div>
  );
};

export default Formations;

// cspell: ignore Notiflix lenght notiflix Andrada, "Rossi", "Izquierdoz", "Heredia", "Golts", "Vergini", "Magallan", "Peruzzi", "Jara", "Buffarini", "Fabra", "Olaza", "Mas", "S.Perez", "Perez", "Barrios", "Nandez", "Villa", "Pavon", "Cardona", "Reynoso", "Tevez", "Zarate", "Wanchope", Benedetto, volvé, debés
import React, { useMemo, useState } from "react";
import useForm from "../../hooks/useForm";
import Notiflix from "notiflix";

const list = [
  "Andrada",
  "Rossi",
  "Izquierdoz",
  "Heredia",
  "Golts",
  "Vergini",
  "Magallan",
  "Peruzzi",
  "Jara",
  "Buffarini",
  "Fabra",
  "Olaza",
  "Mas",
  "S.Perez",
  "Perez",
  "Barrios",
  "Nandez",
  "Villa",
  "Pavon",
  "Cardona",
  "Reynoso",
  "Tevez",
  "Zarate",
  "Wanchope",
  "Benedetto",
];

const TeamForm = () => {
  const { form, changed, setValue } = useForm();
  const [teamName, setTeamName] = useState(form.teamName || "");
  const [playerList, setPlayerList] = useState(
    list.map((name) => name.toLowerCase())
  );
  const [captainName, setCaptainName] = useState(null);
  const [starters, setStarters] = useState([]);
  const [selectMode, setSelectMode] = useState("captain");
  const [selectedOption, setSelectedOption] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [lineups, setLineups] = useState([]);

  const pretty = (name) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const handleAddPlayer = () => {
    const name = (form.playerName || "").trim().toLowerCase();
    if (name.length < 2) {
      Notiflix.Notify.failure("Nombre Corto");
      return;
    }
    if (playerList.some((j) => j.toLowerCase() === name)) {
      Notiflix.Notify.failure("Jugador repetido");
      return;
    }

    setPlayerList((prev) => [...prev, name]);
    setValue("playerName", "");
    Notiflix.Notify.success("Jugador agregado");
  };

  const newLineup = () => {
    if (!teamName) {
      Notiflix.Notify.failure("¿Que Equipo dirigís?");
      return;
    }
    setShowForm(true);
    setCaptainName(null);
    setStarters([]);
    setSelectedOption("");
    setSelectMode("captain");
  };

  const handleSelectedOption = () => {
    if (!selectedOption) {
      Notiflix.Notify.failure("Elegí un capitán");
      return;
    }

    const normalized = selectedOption.toLowerCase();

    if (!playerList.includes(normalized)) {
      Notiflix.Notify.failure("Capitán inválido");
      return;
    }

    if (starters.length >= 11 && !starters.includes(normalized)) {
      Notiflix.Notify.warning("Equipo Titular Completo");
      return;
    }

    setCaptainName(normalized);

    setStarters((prev) =>
      prev.includes(normalized) ? prev : [...prev, normalized]
    );

    setSelectedOption("");
    setSelectMode("starters");
    Notiflix.Notify.success(`Capitán: ${pretty(normalized)}`);
  };

  const handleAddStarter = () => {
    const select = selectedOption.toLowerCase();
    if (!select) {
      Notiflix.Notify.failure("Elegí un jugador");
      return;
    }
    if (starters.length >= 11) {
      Notiflix.Notify.warning("Ya hay 11");
      return;
    }
    if (starters.includes(select)) {
      Notiflix.Notify.warning("Ya está en titulares");
      return;
    }
    setStarters((prev) => [...prev, select]);
    setSelectedOption("");
    Notiflix.Notify.success("Titular agregado");
  };

  const handleSaveStarters = () => {
    if (starters.length !== 11) {
      Notiflix.Notify.failure("Debés elegir exactamente 11 titulares.");
      return;
    }
    if (!captainName) {
      Notiflix.Notify.failure("Elegí un capitán.");
      return;
    }

    if (!starters.includes(captainName)) {
      Notiflix.Notify.failure("El capitán debe estar entre los 11 titulares.");
      return;
    }

    const id =
      crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    const data = {
      id,
      name: teamName,
      captain: captainName,
      starters: [...starters],
      createdAt: new Date(),
    };
    if (teamName && captainName && starters.length === 11) {
      setLineups((prev) => [...prev, data]);
      setShowForm(false);
      Notiflix.Notify.success("Equipo Guardado");
    } else {
      Notiflix.Notify.failure("Problemas al guardar el Equipo");
    }
  };

  const ordered = [...lineups].sort((a, b) => b.createdAt - a.createdAt);

  const { remaining, chosen } = useMemo(() => {
    const remaining = playerList
      .filter((p) => !starters.includes(p))
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    const chosen = playerList
      .filter((p) => starters.includes(p))
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    return { remaining, chosen };
  }, [playerList, starters]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <div className="bg-white shadow-md rounded-xl p-6 space-y-2">
            <h1 className="text-2xl font-bold text-blue-700 mb-2 underline">
              Equipo del DT: {teamName}
            </h1>
            <label htmlFor="teamName">Nombre del Equipo</label>
            <div className="flex flex-row gap-2">
              <input
                type="text"
                name="teamName"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => {
                  Notiflix.Notify.success("Equipo guardado");
                }}
                className="bg-blue-500 text-white rounded"
              >
                Guardar Equipo
              </button>
            </div>

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
                      handleAddPlayer();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="bg-blue-500 text-white  rounded"
                >
                  Añadir Jugador
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Jugadores Añadidos</h2>
              <ul className="list-disc pl-5 grid grid-cols-3 gap-x-6 gap-y-2 mb-2">
                {[...playerList]
                  .sort((a, b) =>
                    a.localeCompare(b, "es", { sensitivity: "base" })
                  )
                  .map((player) => (
                    <li
                      key={player}
                      className="text-gray-700 flex items-center"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          // 1️⃣ Limpiamos derivadas
                          if (selectedOption === player) setSelectedOption("");

                          if (player === captainName) {
                            setCaptainName(null);
                            setSelectMode("captain");
                            setSelectedOption("");
                          }

                          // 2️⃣ Quitamos al jugador de listas
                          setPlayerList((prev) =>
                            prev.filter((j) => j !== player)
                          );
                          if (starters.includes(player)) {
                            setStarters((prev) =>
                              prev.filter((j) => j !== player)
                            );
                          }

                          // 3️⃣ Mostramos las notificaciones al final
                          Notiflix.Notify.success("Jugador eliminado");
                          if (player === captainName) {
                            Notiflix.Notify.info(
                              "Capitán eliminado. Volvé a elegir un capitán."
                            );
                          }
                        }}
                      >
                        🗑️
                      </button>

                      <span>{pretty(player)}</span>
                    </li>
                  ))}
              </ul>
              <hr />
              <p className="mt-1">Total de Jugadores: {playerList.length}</p>
            </div>
            <button
              type="button"
              onClick={newLineup}
              className="bg-blue-500 text-white rounded w-full p-2"
            >
              Nueva Formación
            </button>
          </div>
        </div>
        <div className="space-y-4 bg-white shadow-md rounded-xl p-6">
          {showForm && selectMode === "captain" && (
            <div>
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                Arma tu Formación Inicial
              </h1>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="border w-full"
                disabled={playerList.length === 0}
              >
                <option value="">Seleccionar Capitán</option>
                {[...playerList].sort().map((player) => (
                  <option key={player} value={player}>
                    {pretty(player)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSelectedOption}
                className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                disabled={playerList.length === 0 || selectedOption === ""}
              >
                Confirmar Capitán
              </button>
            </div>
          )}
          {selectMode === "starters" && (
            <div>
              <h1 className="text-xl font-semibold text-gray-800 mb-4 underline">
                Arma tu Formación Inicial
              </h1>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="border w-full"
                disabled={playerList.length === 0}
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
                onClick={handleAddStarter}
                className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                disabled={starters.length >= 11 || selectedOption === ""}
              >
                Agregar Jugador Titular
              </button>
            </div>
          )}
          {captainName && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <strong>Capitán:</strong> {pretty(captainName)}
            </div>
          )}
          {selectMode === "starters" && (
            <div>
              <h1>{`Titulares (${starters.length}/11)`}</h1>
              <ul className="list-disc pl-5 grid grid-cols-3 gap-x-6 gap-y-2 mb-2">
                {[...starters]
                  .sort((a, b) =>
                    a.localeCompare(b, "es", { sensitivity: "base" })
                  )
                  .map((player) => (
                    <li
                      key={player}
                      className="text-gray-700 flex items-center"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          // 1️⃣ Limpiamos derivadas antes que nada
                          if (player === captainName) {
                            setCaptainName(null);
                            setSelectMode("captain");
                            setSelectedOption("");
                          }

                          // 2️⃣ Quitamos al jugador de starters
                          setStarters((prev) =>
                            prev.filter((j) => j !== player)
                          );

                          // 3️⃣ Mostramos la notificación al final
                          Notiflix.Notify.success("Jugador eliminado");

                          // 4️⃣ Si era capitán, notificamos
                          if (player === captainName) {
                            Notiflix.Notify.info(
                              "Capitán eliminado. Volvé a elegir un capitán."
                            );
                          }
                        }}
                      >
                        🗑️
                      </button>
                      <span>{pretty(player)}</span>
                    </li>
                  ))}
              </ul>
              <button
                className="bg-blue-500 text-white rounded w-full p-2 mt-2"
                onClick={handleSaveStarters}
                disabled={starters.length !== 11 || !captainName}
              >
                Guardar Titulares
              </button>
            </div>
          )}
        </div>
        {lineups.length > 0 && (
          <div className="bg-white shadow-md rounded-xl p-6 space-y-2">
            <h1 className="text-xl font-semibold text-green-700 mb-2 underline">
              Formaciones
            </h1>

            {ordered.map((lineup) => {
              const sorted = [...lineup.starters].sort((a, b) =>
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
                  <div className="grid md:grid-cols-3 gap-3">
                    {[col1, col2, col3].map((col, i) => (
                      <ul
                        key={i}
                        className="bg-gray-50 rounded-lg p-4 shadow-inner"
                      >
                        {col.map((player) => (
                          <li
                            key={player}
                            className={`px-2 py-2 rounded ${
                              player === lineup.captain
                                ? "bg-yellow-200 font-bold text-yellow-900"
                                : "hover:bg-gray-100 text-gray-800"
                            }`}
                          >
                            {pretty(player)}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                  <hr />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamForm;

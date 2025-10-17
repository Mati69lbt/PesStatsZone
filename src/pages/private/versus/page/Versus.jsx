import React from "react";
import { usePartido } from "../../../../context/PartidoReducer";
import { pretty } from "../../match/utils/pretty";

const Versus = () => {
  const { state } = usePartido();
  console.log("state", state);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        <span className="text-blue-700 underline">Equipo del DT:</span>{" "}
        <span className="text-3xl font-black tracking-wide bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600 text-transparent bg-clip-text drop-shadow">
          {pretty("Roberto Loco")}
        </span>
      </h1>

      {/* <h1 className="text-2xl font-bold mb-6 text-center">
        📊 Estadísticas del Equipo
      </h1>
      <div className="flex flex-wrap gap-4 mb-2 items-end  justify-center">
        <div className="text-center">
          <label className="text-sm font-medium block">Ámbito</label>
          <select className="border p-1 rounded text-sm">
            <option value="general">General</option>
            <option value="local">Local</option>
            <option value="visitante">Visitante</option>
            <option value="rossi">Rossi</option>
            <option value="andrada">Andrada</option>
          </select>
        </div>
      </div> */}
    </div>
  );
};

export default Versus;

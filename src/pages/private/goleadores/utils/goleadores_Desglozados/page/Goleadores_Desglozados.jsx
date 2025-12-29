import React, { useState } from "react";
import Gol from "../utils/Gol";

const Goleadores_Desglozados = ({ matches }) => {
  const [scope, setScope] = useState("general");
  return (
    <div className="mt-2">
      <h2 className="text-xl font-bold mb-2 text-center">
        👤 Goleadores del equipo
      </h2>
      <div className="mb-1 flex justify-center gap-2">
        {["general", "local", "visitante"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setScope(k)} // <- tu state (general/local/visitante)
            className={`rounded-xl border px-3 py-2 text-sm shadow-sm transition w-full
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${
          scope === k
            ? "bg-blue-600 text-white border-blue-700"
            : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
        }`}
          >
            {k === "general"
              ? "General"
              : k === "local"
              ? "Local"
              : "Visitante"}
          </button>
        ))}
      </div>
      <Gol scope={scope} matches={matches} />
    </div>
  );
};

export default Goleadores_Desglozados;

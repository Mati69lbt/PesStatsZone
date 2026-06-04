import React, { useState } from "react";
import Gol from "../utils/Gol";

const CAMPOS = [
  { value: "nombre", label: "Nombre" },
  { value: "pj", label: "PJ" },
  { value: "goles", label: "Goles" },
  { value: "x2", label: "⚽x2" },
  { value: "x3", label: "⚽x3" },
  { value: "prom", label: "Promedio" },
];

const Goleadores_Desglozados = ({ matches }) => {
  const [scope, setScope] = useState("general");
  const [ordenCampo, setOrdenCampo] = useState("goles");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-2 px-2">
        <h2 className="text-2xl font-bold">🔥 Top Scorer</h2>

        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded-xl border px-1 py-2 text-sm shadow-sm transition
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            bg-white text-slate-800 border-slate-300"
        >
          <option value="general">General</option>
          <option value="local">Local</option>
          <option value="visitante">Visitante</option>
          <option value="neutro">Neutro</option>
        </select>

        <select
          value={ordenCampo}
          onChange={(e) => setOrdenCampo(e.target.value)}
          className="rounded-xl border px-1 py-2 text-sm shadow-sm transition
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
            bg-white text-slate-800 border-slate-300"
        >
          {CAMPOS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() =>
            setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc")
          }
          className="rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
            bg-white text-slate-800 border-slate-300 hover:border-sky-300"
        >
          {ordenDireccion === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <Gol
        scope={scope}
        matches={matches}
        ordenCampo={ordenCampo}
        setOrdenCampo={setOrdenCampo}
        ordenDireccion={ordenDireccion}
        setOrdenDireccion={setOrdenDireccion}
      />
    </div>
  );
};

export default Goleadores_Desglozados;

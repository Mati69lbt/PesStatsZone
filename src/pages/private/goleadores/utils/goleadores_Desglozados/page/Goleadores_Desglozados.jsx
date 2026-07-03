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

  const handleCampoClick = (campoValue) => {
    if (ordenCampo === campoValue) {
      // Si el campo ya estaba activo, invertimos la dirección (flecha)
      setOrdenDireccion((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Si es un campo nuevo, lo activamos y seteamos orden descendente por defecto
      setOrdenCampo(campoValue);
      setOrdenDireccion("desc");
    }
  };

return (
  <div className="mt-2 w-full px-1">
    {/* Contenedor Principal de Filtros */}
    <div className="flex flex-col items-center justify-center gap-3 mb-4 w-full max-w-md mx-auto">
      <h2 className="text-xl font-black text-slate-800 tracking-tight">
        🔥 Top Scorer
      </h2>

      {/* 📊 FILA 1: Selector de Ámbito (Scope) */}
      <div className="flex w-full gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
        {[
          { id: "general", label: "📊 Gral" },
          { id: "local", label: "🏠 Loc" },
          { id: "visitante", label: "✈️ Vis" },
          { id: "neutro", label: "⚖️ Neu" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setScope(item.id)}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 ${
              scope === item.id
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ⚙️ FILA 2: Selector de Criterio de Ordenamiento (CAMPOS) */}
      <div className="flex flex-wrap justify-center gap-1 w-full bg-slate-50 p-1 rounded-xl border border-slate-100">
        {CAMPOS.map((c) => {
          const isActive = ordenCampo === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => handleCampoClick(c.value)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all duration-150 flex items-center gap-1 ${
                isActive
                  ? "bg-slate-800 text-white border-slate-800 shadow-sm font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100/70"
              }`}
            >
              <span>{c.label}</span>
              {/* Flecha integrada: Solo se muestra en el campo activo */}
              {isActive && (
                <span className="text-[10px] font-black text-amber-400 animate-fade-in">
                  {ordenDireccion === "asc" ? "▲" : "▼"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Renderizado de la tabla/componente de goles */}
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

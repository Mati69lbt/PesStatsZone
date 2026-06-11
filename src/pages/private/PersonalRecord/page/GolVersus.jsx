import React, { useMemo, useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import useGoleadoresVersus from "../utils/Hooks/useGoleadoresVersus";
import { pretty } from "../../match/utils/pretty";
import { normalizeName } from "../../../../utils/normalizeName";

const GolVersus = () => {
  const { general, local, visitante, neutral } = useGoleadoresVersus();
  const [activeTab, setActiveTab] = useState("general");

  const [sortConfig, setSortConfig] = useState({
    key: "goles",
    direction: "desc",
  });

  const dataMap = {
    general: general || [],
    local: local || [],
    visitante: visitante || [],
    neutral: neutral || [],
  };

  const dataActual = dataMap[activeTab];

  const sortedData = useMemo(() => {
    let itemsOrdenables = [...dataActual];
    if (sortConfig.key !== null) {
      itemsOrdenables.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Resguardo por si algún valor viene indefinido o roto
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        // Si es texto (Jugador, Club, Rival), usamos localeCompare para ignorar mayúsculas y tildes
        if (typeof aValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Si son números (Goles, PJ, Promedio)
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      });
    }
    return itemsOrdenables;
  }, [dataActual, sortConfig]);

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  /* 🛠️ MODIFICACIÓN 4: Pequeño indicador visual estético (▲ / ▼ / ↕) */
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return (
        <span className="text-slate-400 opacity-40 ml-1.5 text-[10px]">↕</span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <span className="text-blue-500 font-bold ml-1.5 text-[11px]">▲</span>
    ) : (
      <span className="text-blue-500 font-bold ml-1.5 text-[11px]">▼</span>
    );
  };

  // Buscamos el nombre del club activo para darle contexto al título
  const { state: lineupState } = useLineups();
  const activeClubName = lineupState?.activeClub || "Mi Club";

  return (
    <div className="p-2 md:p-4 max-w-4xl mx-auto animate-fade-in">
      {/* Selector de Pestañas (Optimizado responsivo) */}
      <div className="flex justify-center gap-1 mb-4 bg-slate-100 p-1 rounded-xl max-w-sm mx-auto border border-slate-200 shadow-inner">
        {[
          { id: "general", label: "📊 Gral" },
          { id: "local", label: "🏠 Loc" },
          { id: "visitante", label: "✈️ Vis" },
          { id: "neutral", label: "⚖️ Neu" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-[11px] md:text-xs font-black rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenedor de la Tabla Adaptado a Pantallas Chicas */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full text-xs md:text-sm border-collapse bg-white tabular-nums">
            <thead className="bg-slate-800 text-white font-bold text-[10px] md:text-xs uppercase tracking-wide border-b border-slate-200">
              <tr>
                <th className="px-2 md:px-4 py-2.5 text-center w-8">#</th>
                <th
                  className="px-2 md:px-4 py-2.5 text-left w-1/3 cursor-pointer"
                  onClick={() => requestSort("name")}
                  title="Ordenar por nombre de jugador"
                >
                  Jugador {renderSortIndicator("name")}
                </th>
                <th
                  className="px-4 py-2.5 text-left  sm:table-cell w-1/4 cursor-pointer"
                  onClick={() => requestSort("club")}
                  title="Ordenar por club"
                >
                  Club {renderSortIndicator("club")}
                </th>
                <th
                  className="px-2 md:px-4 py-2.5 text-left w-1/3 cursor-pointer"
                  onClick={() => requestSort("rival")}
                  title="Ordenar por equipo rival"
                >
                  Rival {renderSortIndicator("rival")}
                </th>
                <th
                  className="px-1 md:px-4 py-2.5 text-center text-amber-400 w-10 cursor-pointer"
                  onClick={() => requestSort("goles")}
                  title="Ordenar por cantidad de goles"
                >
                  G {renderSortIndicator("goles")}
                </th>
                <th
                  className="px-1 md:px-4 py-2.5 text-center w-10 cursor-pointer"
                  onClick={() => requestSort("partidos")}
                  title="Ordenar por partidos jugados"
                >
                  PJ {renderSortIndicator("partidos")}
                </th>
                <th
                  className="px-2 md:px-4 py-2.5 text-center w-14 cursor-pointer"
                  onClick={() => requestSort("promedio")}
                  title="Ordenar por promedio de gol"
                >
                  Prom {renderSortIndicator("promedio")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-8 text-slate-400 font-medium text-xs"
                  >
                    Ningún jugador registra ≥ 3 goles aquí.
                  </td>
                </tr>
              ) : (
                sortedData.map((player, i) => (
                  <tr
                    key={`${player.name}-${player.rival}-${i}`}
                    className="hover:bg-blue-100/50 odd:bg-slate-100/70 transition-colors"
                  >
                    {/* Posición */}
                    <td className="px-2 md:px-4 py-2 text-center text-slate-400 font-bold text-[11px]">
                      {i + 1}
                    </td>

                    {/* Nombre Jugador */}
                    <td className="px-2 md:px-4 py-2 font-bold text-slate-900 truncate max-w-[800px] md:max-w-none">
                      {pretty(player.name)}
                    </td>

                    {/* Club Origen (Oculto en celular) */}
                    <td className="px-4 py-2 text-slate-500  sm:table-cell">
                      {pretty(player.club)}
                    </td>

                    {/* Rival */}
                    <td
                      className="px-2 md:px-4 py-2 text-slate-600 font-medium max-w-[70px] md:max-w-none "
                      title={pretty(player.rival)}
                    >
                      {pretty(player.rival)}
                    </td>

                    {/* Goles */}
                    <td className="px-1 md:px-4 py-2 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-xs md:text-sm border border-emerald-100">
                        {player.goles}
                      </span>
                    </td>

                    {/* PJ */}
                    <td className="px-1 md:px-4 py-2 text-center font-bold text-slate-500">
                      {player.partidos}
                    </td>

                    {/* Promedio */}
                    <td className="px-2 md:px-4 py-2 text-center font-mono font-bold text-blue-600 text-[11px] md:text-xs">
                      {player.promedio.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GolVersus;

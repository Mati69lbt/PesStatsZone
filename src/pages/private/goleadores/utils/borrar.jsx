import React, { useMemo, useState } from "react";
import { ChevronDown, Trophy, Medal, SoccerBall } from "lucide-react"; // O usa emojis si prefieres
import { 医疗PrettySafe, temporadaKey } from "../../campeonatos/util/funtions";

const GoleadoresPorCampeonato = ({ matches, bucket }) => {
  const [openTorneo, setOpenTorneo] = useState(null);
  const torneosConfig = bucket?.torneosConfig || {};

  // --- Lógica de procesamiento (se mantiene igual a tu archivo original) ---
  // ... (Aquí irían stripYearFromDisplay, splitSeasonFromLabel, golesDelEvento y el useMemo de torneosOrdenados)
  // Nota: He omitido el bloque del useMemo para ir directo al grano del diseño visual.

  const calcularPromedio = (goles, pj) =>
    pj ? (goles / pj).toFixed(2) : "0.00";

  const getHeatmapColor = (promedio) => {
    const p = parseFloat(promedio);
    if (p >= 1.5) return "bg-emerald-100/50";
    if (p >= 1.0) return "bg-emerald-50/50";
    if (p >= 0.5) return "bg-slate-50";
    return "bg-white";
  };

  const getPodiumStyle = (index) => {
    if (index === 0)
      return "bg-yellow-100 border-l-4 border-l-yellow-500 shadow-sm";
    if (index === 1) return "bg-slate-100 border-l-4 border-l-slate-400";
    if (index === 2) return "bg-orange-100 border-l-4 border-l-orange-400";
    return "";
  };

  return (
    <div className="mt-6 px-2 md:px-0">
      <h2 className="text-2xl font-black mb-6 text-center text-slate-800 tracking-tight">
        🏆 GOLEADORES POR CAMPEONATO
      </h2>

      {torneosOrdenados.map((torneo) => {
        const isOpen = openTorneo === torneo.label;
        const jugadores = Object.values(torneo.jugadores)
          .filter((j) => j.goles > 0)
          .sort(
            (a, b) => b.goles - a.goles || a.nombre.localeCompare(b.nombre),
          );

        return (
          <div
            key={torneo.label}
            className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-300"
          >
            {/* HEAD - ACCORDEON */}
            <div
              onClick={() => setOpenTorneo(isOpen ? null : torneo.label)}
              className={`cursor-pointer flex items-center justify-between p-4 transition-colors ${
                isOpen
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Trophy
                  className={isOpen ? "text-yellow-400" : "text-slate-400"}
                  size={20}
                />
                <span className="font-bold uppercase tracking-wide">
                  {torneo.label}
                </span>
              </div>
              <ChevronDown
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>

            {/* BODY - TABLE */}
            <div
              className={`transition-all duration-300 ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
            >
              <div className="overflow-x-auto p-2">
                <table className="w-full text-xs md:text-sm border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-slate-500 uppercase text-[10px] tracking-widest">
                      <th className="px-2 py-2 text-center">Pos</th>
                      <th className="px-2 py-2 text-left">Jugador</th>
                      <th className="px-2 py-2 text-center">PJ</th>
                      <th className="px-2 py-2 text-center">Goles</th>
                      <th className="px-2 py-2 text-center">Prom.</th>
                      <th className="px-2 py-2 text-center">Especiales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jugadores.map((j, idx) => {
                      const promedio = calcularPromedio(j.goles, j.pj);
                      return (
                        <tr
                          key={j.nombre}
                          className={`${getPodiumStyle(idx)} ${!getPodiumStyle(idx) && getHeatmapColor(promedio)} transition-colors`}
                        >
                          <td className="py-3 text-center font-bold">
                            {idx === 0 && "🥇"}
                            {idx === 1 && "🥈"}
                            {idx === 2 && "🥉"}
                            {idx > 2 && idx + 1}
                          </td>
                          <td className="py-3 px-2 font-semibold text-slate-800">
                            {j.nombre}
                          </td>
                          <td className="text-center font-medium">{j.pj}</td>
                          <td className="text-center">
                            <span className="bg-slate-800 text-white px-2 py-1 rounded-md font-bold">
                              {j.goles}
                            </span>
                          </td>
                          <td className="text-center font-mono text-slate-600">
                            {promedio}
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center gap-1">
                              {j.x2 > 0 && (
                                <span className="flex items-center bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 text-[10px] font-bold">
                                  x2 <span className="ml-1">⚽</span>
                                </span>
                              )}
                              {j.x3 > 0 && (
                                <span className="flex items-center bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 text-[10px] font-bold shadow-sm">
                                  x3 <span className="ml-1">🔥</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GoleadoresPorCampeonato;

import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import Ultimos10Resultados from "./Ultimos10Resultados";
import usePartidosLegacy from "../hooks/usePartidosLegacy";
import useResumenTemporada from "../hooks/useResumenTemporada";
import {
  columnas,
  emptyTriple,
  renderBloques,
  renderBloquesDe,
  metricas,
  BloqueHeader,
  FilaDatos,
  getColorSegunResultado,
  getColorSegunDiferenciaDeGol,
} from "../utils/Funciones";
import { pretty } from "../../match/utils/pretty";
import TopGoleadores from "./Goleadores";
import { Navigate } from "react-router-dom";

const metricToKey = {
  PJ: "pj",
  G: "g",
  E: "e",
  P: "p",
  GF: "gf",
  GC: "gc",
  DF: "df",
};

// Celdas para mobile: usa mismos colores que el resto de la app
const renderStatsCells = (stats = {}) =>
  metricas.map((m) => {
    const prop = metricToKey[m];
    const val = stats?.[prop] ?? 0;

    const colorClass =
      m === "DF"
        ? getColorSegunDiferenciaDeGol(stats?.df ?? 0)
        : getColorSegunResultado(stats);

    return (
      <td key={m} className={`px-2 py-1 text-center ${colorClass}`}>
        {val}
      </td>
    );
  });

const Season = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);

  const clubs = Object.keys(lineupState?.lineups || []);
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || ""
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;

  const clubData = lineupState?.lineups?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0;
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;

  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];

  // Resumen por temporada
  const { temporadasOrdenadas, resumenPorTemporada, captainsOrdenados } =
    useResumenTemporada(matches);

  // Últimos 10 para el widget
  const partidosLegacy = usePartidosLegacy(matches);

  // Ordenar temporadas de la más reciente a la más vieja
  const temporadasDesc = [...(temporadasOrdenadas || [])].reverse();

  const visibleClub = selectedClub;

  const pick = (obj, keys) =>
    keys.reduce((acc, k) => (obj?.[k] ? { ...acc, [k]: obj[k] } : acc), {});

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      {/* Header + selector de club */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-center">📆 Temporadas</h1>
        {clubs.length > 0 && (
          <div className="text-center mt-3">
            <label className="text-sm font-medium block">Club</label>
            <select
              className="border p-1 rounded text-sm"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
            >
              {clubs.map((c) => (
                <option key={c} value={c}>
                  {pretty(c)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Últimos 10 resultados */}
      <Ultimos10Resultados partidos={partidosLegacy} />

      {/* Tabla por temporada (Season) */}
      {temporadasDesc.map((temp) => {
        const rTemp = resumenPorTemporada[temp];
        if (!rTemp) return null;

        const caps = Array.isArray(captainsOrdenados) ? captainsOrdenados : [];
        const tripleSeason = rTemp.general || emptyTriple();

        return (
          <div key={temp} className="mb-8 space-y-3">
            {/* MOBILE: layout apilado (md:hidden) */}
            <div className="flex justify-evenly ">
              <div className="lg:hidden max-h-full overflow-auto overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="sticky top-0 z-10 bg-sky-50 text-slate-700 font-semibold shadow-sm text-[10px] uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left border-b border-slate-200">
                        Temporada
                      </th>
                      {metricas.map((m) => (
                        <th
                          key={`head-${m}`}
                          className="px-2 py-2 text-center border-b border-slate-200"
                        >
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* ---- Bloque temporada (General / Local / Visitante / Neutral) ---- */}

                    {/* General: fila 2 */}
                    <tr className="border-t border-slate-100 bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="px-2 py-1.5 w-24 whitespace-nowrap font-semibold text-left text-slate-800">
                        {temp}
                      </td>
                      {renderStatsCells(tripleSeason.General)}
                    </tr>

                    {/* Local */}
                    <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                        Local
                      </td>
                      {renderStatsCells(tripleSeason.Local)}
                    </tr>

                    {/* Visitante */}
                    <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                        Visitante
                      </td>
                      {renderStatsCells(tripleSeason.Visitante)}
                    </tr>

                    {/* Neutral */}
                    <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                        Neutral
                      </td>
                      {renderStatsCells(tripleSeason.Neutral)}
                    </tr>

                    {/* ---- Bloques por capitán ---- */}
                    {caps.map((cap) => {
                      const tripleCap = rTemp.capitanes?.[cap] || emptyTriple();

                      return (
                        <React.Fragment key={`${temp}-${cap}`}>
                          {/* Capitán - General */}
                          <tr className="border-t border-slate-200 bg-white hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-1.5 font-semibold text-left text-slate-800">
                              {pretty(cap)}
                            </td>
                            {renderStatsCells(tripleCap.General)}
                          </tr>

                          {/* Capitán - Local */}
                          <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                            <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                              Local
                            </td>
                            {renderStatsCells(tripleCap.Local)}
                          </tr>

                          {/* Capitán - Visitante */}
                          <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                            <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                              Visitante
                            </td>
                            {renderStatsCells(tripleCap.Visitante)}
                          </tr>

                          {/* Capitán - Neutral */}
                          <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                            <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                              Neutral
                            </td>
                            {renderStatsCells(tripleCap.Neutral)}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:w-max lg:hidden">
                <TopGoleadores
                  playersStats={data?.playersStats}
                  topN={9}
                  mode="vertical"
                  className="mt-0"
                />
              </div>
            </div>

            {/* DESKTOP/TABLET: tabla completa (hidden en mobile) */}
            <div className="hidden lg:block max-h-[75vh] overflow-auto border border-slate-200 rounded-lg bg-white shadow-sm">
              <table className="mx-auto w-full min-w-[860px] text-[11px] md:text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-sky-50 text-slate-700 font-semibold shadow-sm text-[10px] md:text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-2 py-2 w-28 whitespace-nowrap text-left border-b border-slate-200">
                      Temporada
                    </th>

                    <th
                      className="px-2 py-2 text-center border-b border-slate-200"
                      colSpan={14}
                    >
                      {clubKey}
                    </th>
                  </tr>
                  <tr>
                    <th className="px-2 py-1 text-center border-b border-slate-200"></th>
                    {metricas.map((m) => (
                      <th
                        key={`G-${m}`}
                        className="px-2 py-1 text-center border-b border-slate-200"
                      >
                        {m}
                      </th>
                    ))}
                    {metricas.map((m) => (
                      <th
                        key={`N-${m}`}
                        className="px-2 py-1 text-center border-b border-slate-200"
                      >
                        {m} N
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Temporada: General / Neutral */}
                  <tr className="bg-white border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                    <td className="border-r border-slate-200 font-semibold text-center">
                      {temp}
                    </td>
                    <FilaDatos
                      triple={rTemp.general}
                      orden={["General", "Neutral"]}
                    />
                  </tr>

                  {/* Headers Local / Visitante */}
                  <tr className="bg-slate-50">
                    <td className="border-r border-slate-200 px-2 py-1 text-center text-[10px] uppercase text-slate-600">
                      Condición
                    </td>
                    {metricas.map((m) => (
                      <th
                        key={`L-${m}`}
                        className="border-b border-t border-slate-200 px-2 py-1 text-center text-[10px]"
                      >
                        {m} L
                      </th>
                    ))}
                    {metricas.map((m) => (
                      <th
                        key={`V-${m}`}
                        className="border-b border-t border-slate-200 px-2 py-1 text-center text-[10px]"
                      >
                        {m} V
                      </th>
                    ))}
                  </tr>

                  {/* Temporada: Local / Visitante */}
                  <tr className="bg-white border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                    <td className="border-r border-slate-200 px-2 py-1 text-center text-[10px] uppercase text-slate-600">
                      Totales
                    </td>
                    <FilaDatos
                      triple={rTemp.general}
                      orden={["Local", "Visitante"]}
                    />
                  </tr>

                  {/* Bloques por capitán */}
                  {caps.map((cap) => {
                    const tripleCap = rTemp.capitanes?.[cap] || emptyTriple();
                    return (
                      <React.Fragment key={`${temp}-${cap}`}>
                        {/* Header capitán (G/N) */}
                        <tr className="bg-slate-100 border-t border-slate-200">
                          <td className="border-r border-slate-200 font-semibold px-2 py-1 text-left">
                            {pretty(cap)}
                          </td>
                          <BloqueHeader
                            etiquetas={["General", "Neutral"]}
                            sufijos={["", " N"]}
                          />
                        </tr>

                        {/* Datos capitán G/N */}
                        <tr className="bg-white hover:bg-slate-50/70 transition-colors">
                          <td className="border-r border-slate-200 px-2 py-1"></td>
                          <FilaDatos
                            triple={tripleCap}
                            orden={["General", "Neutral"]}
                          />
                        </tr>

                        {/* Headers L/V */}
                        <tr className="bg-slate-50">
                          <td className="border-r border-slate-200 px-2 py-1 text-[10px] uppercase text-slate-600">
                            Condición
                          </td>
                          <BloqueHeader
                            etiquetas={["Local", "Visitante"]}
                            sufijos={[" L", " V"]}
                          />
                        </tr>

                        {/* Datos capitán L/V */}
                        <tr className="bg-white border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                          <td className="border-r border-slate-200 px-2 py-1"></td>
                          <FilaDatos
                            triple={tripleCap}
                            orden={["Local", "Visitante"]}
                          />
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* GOLEADORES de esa temporada */}
            <TopGoleadores
              playersStats={data?.playersStats}
              topN={7}
              mode="horizontal"
            />
          </div>
        );
      })}
      {/* FIN Tabla por temporada */}
    </div>
  );
};

export default Season;

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
  "PTS/EFEC": "ptsEfec",
};

const ringBySign = (n) => {
  if (n > 0) return "ring-green-400";
  if (n < 0) return "ring-red-400";
  return "ring-yellow-400";
};

const CircleValue = ({ value, title }) => (
  <span
    className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${ringBySign(
      value
    )} h-6 w-6 text-[10px] font-extrabold text-black`}
    title={title}
  >
    {value}
  </span>
);

// Celdas para mobile: usa mismos colores que el resto de la app
const renderStatsCells = (stats = {}) =>
  metricas.map((m, idx) => {
    const rowBg = getColorSegunResultado(stats);
    const colorClass = rowBg;
    const sepClass = idx === 0 ? "" : " border-2 border-white/70";

    // ✅ CAMBIO: valor especial para G/P (g - p)
    let val = 0;

    if (m === "G/P") {
      const g = stats?.g ?? 0;
      const p = stats?.p ?? 0;
      val = g - p;
    } else if (m === "PTS/EFEC") {
      const g = Number(stats?.g ?? 0);
      const e = Number(stats?.e ?? 0);
      const pj = Number(stats?.pj ?? 0);

      const obtenidos = g * 3 + e * 1;
      const posibles = pj * 3;
      const efec = posibles > 0 ? Math.round((obtenidos / posibles) * 100) : 0;

      // lo devolvemos como objeto para renderizar bonito abajo
      val = { obtenidos, posibles, efec };
    } else {
      const prop = metricToKey[m];
      val = stats?.[prop] ?? 0;
    }

    return (
      <td key={m} className={`px-2 py-1 text-center ${colorClass}${sepClass}`}>
        {m === "G/P" ? (
          <CircleValue
            value={val}
            title={`G/P = ${stats?.g ?? 0} - ${stats?.p ?? 0} = ${val}`}
          />
        ) : m === "DF" ? (
          <CircleValue value={val} title={`DF = ${val}`} />
        ) : m === "PTS/EFEC" ? (
          <div className="flex flex-col items-center leading-none">
            <span className="text-[10px] font-bold tabular-nums">
              {val.obtenidos}/{val.posibles}
            </span>
            <span className="text-[9px] text-slate-600 tabular-nums">
              {val.efec}%
            </span>
          </div>
        ) : (
          val
        )}
      </td>
    );
  });

const Season = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);

  const clubs = Object.keys(lineupState?.lineups || {});
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
  const years = Array.from(
    new Set(
      matches
        .map((m) => m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio)
        .filter((y) => y !== undefined && y !== null)
        .map(String)
    )
  ).sort();

  // Resumen por temporada
  const { temporadasOrdenadas, resumenPorTemporada, captainsOrdenados } =
    useResumenTemporada(matches);

  // Últimos 10 para el widget
  const partidosLegacy = usePartidosLegacy(matches);

  // Ordenar temporadas de la más reciente a la más vieja
  const temporadasDesc = [...(temporadasOrdenadas || [])].sort((a, b) => {
    const yearsA = String(a).match(/\d{4}/g) || [];
    const yearsB = String(b).match(/\d{4}/g) || [];

    const keyA = yearsA.length ? Math.max(...yearsA.map(Number)) : -Infinity;
    const keyB = yearsB.length ? Math.max(...yearsB.map(Number)) : -Infinity;

    return keyB - keyA; // más reciente primero
  });

  const visibleClub = selectedClub;

  const pick = (obj, keys) =>
    keys.reduce((acc, k) => (obj?.[k] ? { ...acc, [k]: obj[k] } : acc), {});

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      {/* Header + selector de club */}
      <div>
        <h1 className="text-2xl font-bold text-center">📆 Temporadas</h1>
        {clubs.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
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

      {/* Últimos 10 resultados
      <Ultimos10Resultados partidos={partidosLegacy} /> */}

      {/* Tabla por temporada (Season) */}
      {temporadasDesc.map((temp) => {
        const years = String(temp).match(/\d{4}/g) || [];

        const rTemp = resumenPorTemporada[temp];
        if (!rTemp) return null;

        const caps = Array.isArray(captainsOrdenados) ? captainsOrdenados : [];
        const tripleSeason = rTemp.general || emptyTriple();

        return (
          <div key={temp} className="m-2 space-y-3">
            {/* MOBILE: layout apilado (md:hidden) */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-evenly sm:gap-6">
              <div className="lg:hidden max-h-full overflow-auto overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="sticky top-0 z-10 bg-sky-50 text-slate-700 font-semibold shadow-sm text-[10px] uppercase tracking-wide">
                    <tr>
                      <th className="px-2 py-2 w-[76px] max-w-[76px] text-left border-b border-slate-200">
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
                      <td className="px-2 py-1.5 w-[76px] max-w-[76px] font-semibold text-left text-slate-800">
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

                    {/* Neutral (solo si PJ > 0) */}
                    {(tripleSeason?.Neutral?.pj ?? 0) > 0 ? (
                      <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                        <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                          Neutral
                        </td>
                        {renderStatsCells(tripleSeason.Neutral)}
                      </tr>
                    ) : null}

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

                          {/* Capitán - Neutral (solo si PJ > 0) */}
                          {(tripleCap?.Neutral?.pj ?? 0) > 0 ? (
                            <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                              <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                                Neutral
                              </td>
                              {renderStatsCells(tripleCap.Neutral)}
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
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
                      colSpan={metricas.length * 2}
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
                        className="border border-black px-2 py-1 text-center text-[12px]"
                      >
                        {m} L
                      </th>
                    ))}
                    {metricas.map((m) => (
                      <th
                        key={`V-${m}`}
                        className="border border-black px-2 py-1 text-center text-[12px]"
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
            <div className="hidden lg:block">
              <TopGoleadores
                playersStats={data?.playersStats}
                topN={14}
                mode="horizontal"
                years={years}
                data={data}
              />
            </div>
          </div>
        );
      })}
      {/* FIN Tabla por temporada */}
    </div>
  );
};

export default Season;

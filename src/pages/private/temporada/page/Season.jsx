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
  BloqueHeader, // <<< NUEVO
  FilaDatos,
} from "../utils/Funciones";
import { pretty } from "../../match/utils/pretty";
import TopGoleadores from "./Goleadores";

const Season = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [data, setData] = useState(null);

  console.log(data);

  const clubs = Object.keys(lineupState?.lineups || []);
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || ""
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];

  // NUEVO: obtener resumen de temporadas con los matches actuales
  const { temporadasOrdenadas, resumenPorTemporada, captainsOrdenados } =
    useResumenTemporada(matches);

  // NUEVO: convertir a formato "legacy" para el widget de últimos 10
  const partidosLegacy = usePartidosLegacy(matches);

  const visibleClub = selectedClub;

  const pick = (obj, keys) =>
    keys.reduce((acc, k) => (obj?.[k] ? { ...acc, [k]: obj[k] } : acc), {});

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      {/* Header centrado  selector derecha */}
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
      {/* Últimos 10 resultados (general y por "equipo/capitán") */}
      <Ultimos10Resultados partidos={partidosLegacy} /> {/* CAMBIO */}
      {/* Tabla por temporada */}
      {temporadasOrdenadas.map((temp) => {
        const rTemp = resumenPorTemporada[temp];
        if (!rTemp) return null;

        const caps = Array.isArray(captainsOrdenados) ? captainsOrdenados : [];

        return (
          <div
            key={temp}
            className="mb-8 border rounded shadow overflow-x-auto"
          >
            <table className="mx-auto w-full min-w-[860px] text-[11px] md:text-sm border">
              <thead>
                <tr className="bg-blue-200">
                  <th className="border px-2 py-1 w-40">Temporada</th>
                  <th className="border px-2 py-1 text-center" colSpan={14}>
                    {/* Fila 1: general(neutro) => 2 bloques de 7 */}
                    {/* encabezo con 'metricas' por bloque */}
                    {/* Se verá la segunda fila de headers con métricas */}
                  </th>
                </tr>
                {/* Fila 1 (B→H general, I→O neutral): headers métricas */}
                <tr className="bg-blue-100">
                  <th className="border px-2 py-1 text-center"></th>
                  {metricas.map((m) => (
                    <th key={`G-${m}`} className="border px-2 py-1 text-center">
                      {m}
                    </th>
                  ))}
                  {metricas.map((m) => (
                    <th key={`N-${m}`} className="border px-2 py-1 text-center">
                      {m} N
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Fila 2: valores de temporada (General  Neutral) */}
                <tr className="bg-white">
                  <td className="border font-semibold text-center">{temp}</td>
                  <FilaDatos
                    triple={rTemp.general}
                    orden={["General", "Neutral"]}
                  />
                </tr>

                {/* Fila 3: títulos Local  Visitante */}
                <tr className="bg-blue-50">
                  <td className="border px-2 py-1 text-center"></td>
                  {metricas.map((m) => (
                    <th key={`L-${m}`} className="border px-2 py-1 text-center">
                      {m} L
                    </th>
                  ))}
                  {metricas.map((m) => (
                    <th key={`V-${m}`} className="border px-2 py-1 text-center">
                      {m} V
                    </th>
                  ))}
                </tr>

                {/* Fila 4: valores de temporada (Local  Visitante) */}
                <tr className="bg-white">
                  <td className="border font-semibold text-center"></td>
                  <FilaDatos
                    triple={rTemp.general}
                    orden={["Local", "Visitante"]}
                  />
                </tr>

                {/* Bloques de capitanes (se repiten 4 filas por cada capitán) */}
                {caps.map((cap) => {
                  const tripleCap = rTemp.capitanes?.[cap] || emptyTriple();
                  return (
                    <React.Fragment key={`${temp}-${cap}`}>
                      {/* Título capitán (columna A)  headers G/N (B→O) */}
                      <tr className="bg-blue-200">
                        <td className="border font-semibold px-2 py-1">
                          {pretty(cap)}
                        </td>
                        <BloqueHeader
                          etiquetas={["General", "Neutral"]}
                          sufijos={["", " N"]}
                        />
                      </tr>
                      {/* Datos capitán G/N */}
                      <tr className="bg-white">
                        <td className="border px-2 py-1"></td>
                        <FilaDatos
                          triple={tripleCap}
                          orden={["General", "Neutral"]}
                        />
                      </tr>
                      {/* Headers L/V */}
                      <tr className="bg-blue-50">
                        <td className="border px-2 py-1"></td>
                        <BloqueHeader
                          etiquetas={["Local", "Visitante"]}
                          sufijos={[" L", " V"]}
                        />
                      </tr>
                      {/* Datos capitán L/V */}
                      <tr className="bg-white">
                        <td className="border px-2 py-1"></td>
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

            {/* Sección GOLEADORES (dos filas: posgoles / nombre) */}
            <TopGoleadores playersStats={data?.playersStats} topN={7} />
          </div>
        );
      })}
    </div>
  );
};

export default Season;

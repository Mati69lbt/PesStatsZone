// cspell: ignore Ambito Direccion Resumenes resumenes Estadisticas estadisticas Segun funtions
import React, { useEffect, useMemo, useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { normalizeName } from "../../../../utils/normalizeName";
import useCaptainsMemo from "../hooks/useCaptainsMemo";
import useResumenesMemo from "../hooks/useResumenesMemo";
import useEstadisticasMemo from "../hooks/useEstadisticasMemo";
import { displayNoMinus, formatearResumen, getColorSegunResultado } from "../util/funtions";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useUserData } from "../../../../hooks/useUserData";
import { pretty } from "../../match/utils/pretty";
import { Navigate } from "react-router-dom";
import { useFiltroTorneo } from "../hooks/FiltroTorneo";

const prettySafe = (s) =>
  typeof s === "string" && s.trim() ? pretty(s) : String(s ?? "");

const prettyScope = (s) => {
  if (s === "general") return "General";
  if (s === "local") return "Local";
  if (s === "visitante") return "Visitante";
  // para columnas dinámicas (capitanes)
  return prettySafe(s);
};

const emptyBox = () => ({ pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 });

const Versus = () => {
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

  const matchesBase = Array.isArray(data?.matches) ? data.matches : [];

  const { torneoSel, setTorneoSel, torneoOptions, matchesFiltrados } =
    useFiltroTorneo(matchesBase);

  // usamos los filtrados para TODO lo que calcula stats
  const matches = matchesFiltrados;

  const [ordenAmbito, setOrdenAmbito] = useState("general");
  const [ordenCampo, setOrdenCampo] = useState("rival");
  const [ordenDireccion, setOrdenDireccion] = useState("asc");

  const captains = useCaptainsMemo(matches);
  const resumenes = useResumenesMemo(matches);
  const estadisticas = useEstadisticasMemo(
    resumenes,
    ordenAmbito,
    ordenCampo,
    ordenDireccion
  );

  const columnas = useMemo(
    () => ["general", "local", "visitante", ...captains],
    [captains]
  );

  return (
    <div className="p-2 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center mt-4">
        📊 Estadísticas del Equipo
      </h1>

      {/* Controles (iguales a los que ya usabas) */}
      <div
        className="
    mb-3
    grid grid-cols-2 gap-3
    items-end
    md:flex md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-3
  "
      >
        {/* Club */}
        <div className="text-center">
          <label className="text-sm font-medium block text-slate-700">
            Club
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {prettySafe(c)}
              </option>
            ))}
          </select>
        </div>

        {/* Ámbito */}
        <div className="text-center">
          <label className="text-sm font-medium block text-slate-700">
            Ámbito
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={ordenAmbito}
            onChange={(e) => setOrdenAmbito(e.target.value)}
          >
            <option value="general">General</option>
            <option value="local">Local</option>
            <option value="visitante">Visitante</option>
            {captains.map((c) => (
              <option key={c} value={c}>
                {prettySafe(c)}
              </option>
            ))}
          </select>
        </div>

        {/* Campo */}
        <div className="text-center">
          <label className="text-sm font-medium block text-slate-700">
            Campo
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={ordenCampo}
            onChange={(e) => setOrdenCampo(e.target.value)}
          >
            <option value="rival">Nombre</option>
            <option value="pj">PJ</option>
            <option value="g">G</option>
            <option value="e">E</option>
            <option value="p">P</option>
            <option value="gp">G/P</option>
            <option value="gf">GF</option>
            <option value="gc">GC</option>
            <option value="df">DF</option>
          </select>
        </div>

        {/* Orden */}
        <div className="text-center">
          <label className="text-sm font-medium block text-slate-700">
            Orden
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={ordenDireccion}
            onChange={(e) => setOrdenDireccion(e.target.value)}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>

        {/* Campeonato (full width en mobile) */}
        <div className="col-span-2 text-center md:col-span-1">
          <label className="text-sm font-medium block text-slate-700">
            Campeonato
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                 disabled:bg-slate-100 disabled:text-slate-500"
            value={torneoSel}
            onChange={(e) => setTorneoSel(e.target.value)}
            disabled={torneoOptions.length <= 1}
          >
            {torneoOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {prettySafe(o.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla responsive como la anterior */}
      <div className="max-h-[80vh] w-[100%] mx-auto overflow-auto border rounded">
        <table className="min-w-full w-max table-auto text-[11px] md:text-sm border-collapse">
          <thead className="bg-blue-200 sticky top-0 shadow-lg">
            <tr>
              <th className="border px-2 py-2 min-w-[64px] w-[64px] text-left font-bold">
                Rival
              </th>
              {columnas.map((col) => (
                <th
                  key={col}
                  className="border px-2 py-1 text-center min-w-[110px]"
                >
                  {prettyScope(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(estadisticas) || estadisticas.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + columnas.length}
                  className="border px-3 py-6 text-center text-gray-500 font-semibold"
                >
                  Sin datos
                </td>
              </tr>
            ) : (
              estadisticas.map(([rival, stats], index) => {
                const rivalText =
                  typeof rival === "string"
                    ? rival.trim().replace(/\s+/g, " ")
                    : String(rival ?? "Sin Rival");

                const rivalKey = normalizeName(rivalText) || `rival-${index}`;

                const rivalCell = (
                  <div style={{ lineHeight: "1.2", padding: "4px 0" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#666",
                        fontSize: "0.85em",
                      }}
                    >
                      {index + 1} -
                    </span>
                    <br />
                    <span
                      style={{ fontSize: "1em", textTransform: "capitalize" }}
                    >
                      {rivalText}
                    </span>
                  </div>
                );
                const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-200";
                const hasSpace = /\s/.test(rivalText);
                return (
                  <tr key={rivalKey} className={rowBg}>
                    <td className="border px-1 py-2 font-semibold text-left w-[64px] min-w-[64px]">
                      <div
                        title={rivalText}
                        className={
                          hasSpace
                            ? "block w-full whitespace-normal"
                            : "block w-full truncate"
                        }
                      >
                        {rivalCell}
                      </div>
                    </td>
                    {columnas.map((col) => {
                      const box = stats[col] || emptyBox();
                      const bg =
                        box.pj > 0 ? getColorSegunResultado(box) : rowBg;
                      const df = box.gf - box.gc;
                      const dfClass =
                        df > 0
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500"
                          : df < 0
                          ? "bg-rose-50 text-rose-800 ring-1 ring-rose-500"
                          : "bg-slate-50 text-slate-700 ring-1 ring-slate-200";

                      const gp = (box.g ?? 0) - (box.p ?? 0);

                      const gpRing =
                        gp > 0
                          ? "ring-emerald-500"
                          : gp < 0
                          ? "ring-rose-500"
                          : "ring-yellow-400";

                      if (box.pj === 0) {
                        return (
                          <td
                            key={col}
                            className={`border px-1 py-1 overflow-hidden text-center align-middle ${rowBg} min-w-[110px]`}
                          >
                            <span className="text-xl font-black text-gray-900 leading-none">
                              —
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col}
                          className={`border px-1 py-1 overflow-hidden text-center align-top ${bg} min-w-[110px]`}
                        >
                          <div className="w-full leading-tight">
                            {/* Línea 1: G · E · P (labels) */}
                            {/* Línea 1: G · E · P · G/P (labels) */}
                            <div className="text-[12px] text-gray-500 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
                              <span>G</span>
                              <span className="text-gray-400">·</span>
                              <span>E</span>
                              <span className="text-gray-400">·</span>
                              <span>P</span>
                              <span className="text-gray-400">·</span>
                              <span>G/P</span>
                            </div>

                            {/* Línea 2: G · E · P · G/P (values) */}
                            <div className="font-bold tabular-nums grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
                              <span>{box.g}</span>
                              <span className="text-gray-400">·</span>
                              <span>{box.e}</span>
                              <span className="text-gray-400">·</span>
                              <span>{box.p}</span>
                              <span className="text-gray-400">·</span>

                              {/* ✅ CAMBIO: círculo G/P */}
                              <span className="justify-self-center">
                                <span
                                  className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${gpRing} h-6 w-6 text-[10px] font-extrabold text-black`}
                                  title={`G/P = ${box.g} - ${box.p} = ${gp}`}
                                >
                                  {displayNoMinus(gp)}
                                </span>
                              </span>
                            </div>

                            {/* Línea 3: PJ · GF · GC · DF (labels) */}
                            <div className="mt-0.5 text-[12px] text-gray-500 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
                              <span>PJ</span>
                              <span className="text-gray-400">·</span>
                              <span>GF</span>
                              <span className="text-gray-400">·</span>
                              <span>GC</span>
                              <span className="text-gray-400">·</span>
                              <span>DF</span>
                            </div>

                            {/* Línea 4: PJ · GF · GC · DF (values) */}
                            <div className="font-bold tabular-nums grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
                              <span>{box.pj}</span>
                              <span className="text-gray-400">·</span>
                              <span>{box.gf}</span>
                              <span className="text-gray-400">·</span>
                              <span>{box.gc}</span>
                              <span className="text-gray-400">·</span>
                              <span className="justify-self-center">
                                <span
                                  className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${
                                    df > 0
                                      ? "ring-emerald-500"
                                      : df < 0
                                        ? "ring-rose-500"
                                        : "ring-yellow-400"
                                  } h-6 w-6 text-[10px] font-extrabold text-black`}
                                  title={`DF = ${df}`}
                                >
                                  {df > 0 ? `${df}` : displayNoMinus(df)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Versus;

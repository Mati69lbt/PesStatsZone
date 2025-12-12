// cspell: ignore Ambito Direccion Resumenes resumenes Estadisticas estadisticas Segun funtions
import React, { useEffect, useMemo, useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { normalizeName } from "../../../../utils/normalizeName";
import useCaptainsMemo from "../hooks/useCaptainsMemo";
import useResumenesMemo from "../hooks/useResumenesMemo";
import useEstadisticasMemo from "../hooks/useEstadisticasMemo";
import { formatearResumen, getColorSegunResultado } from "../util/funtions";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useUserData } from "../../../../hooks/useUserData";
import { pretty } from "../../match/utils/pretty";

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

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  const matches = Array.isArray(data?.matches) ? data.matches : [];

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
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        📊 Estadísticas del Equipo
      </h1>

      {/* Controles (iguales a los que ya usabas) */}
      <div className="flex flex-wrap gap-4 mb-2 items-end justify-center">
        {/* Club */}
        <div className="text-center">
          <label className="text-sm font-medium block">Club</label>
          <select
            className="border p-1 rounded text-sm"
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
          <label className="text-sm font-medium block">Ámbito</label>
          <select
            className="border p-1 rounded text-sm"
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

        <div>
          <label className="text-sm font-medium block">Campo</label>
          <select
            value={ordenCampo}
            onChange={(e) => setOrdenCampo(e.target.value)}
            className="border p-1 rounded text-sm"
          >
            <option value="rival">Nombre</option>
            <option value="pj">PJ</option>
            <option value="g">G</option>
            <option value="e">E</option>
            <option value="p">P</option>
            <option value="gf">GF</option>
            <option value="gc">GC</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block">Orden</label>
          <select
            value={ordenDireccion}
            onChange={(e) => setOrdenDireccion(e.target.value)}
            className="border p-1 rounded text-sm"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

      {/* Tabla responsive como la anterior */}
      <div className="max-h-[80vh] w-[100%] mx-auto overflow-auto border rounded">
        <table className="w-full table-fixed text-[11px] md:text-sm border-collapse">
          <thead className="bg-blue-200 sticky top-0 shadow-lg">
            <tr>
              <th className="border px-2 py-2 w-[70px] text-left font-bold">
                Rival
              </th>
              {columnas.map((col) => (
                <th
                  key={col}
                  className="border px-2 py-1 text-center w-[100px]"
                >
                  {prettyScope(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {estadisticas.map(([rival, stats], index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-200";
              return (
                <tr key={rival} className={rowBg}>
                  <td className="border px-2 py-2 font-semibold text-left">
                    <div title={rival}>{rival}</div>
                  </td>
                  {columnas.map((col) => {
                    const box = stats[col] || emptyBox();
                    const bg = box.pj > 0 ? getColorSegunResultado(box) : rowBg;
                    const df = box.gf - box.gc;
                    const dfClass =
                      df > 0
                        ? "text-green-800"
                        : df < 0
                        ? "text-red-800"
                        : "text-gray-700";

                    const dfTxt =
                      df > 0 ? `${df}` : df < 0 ? `${Math.abs(df)}` : "0";

                    return (
                      <td
                        key={col}
                        className={`border px-1 py-1 whitespace-pre-line text-center align-top ${bg}`}
                      >
                        <div className="flex flex-col items-center leading-tight">
                          {/* Línea 1: G-E-P grande */}
                          <div className="text-[12px] text-gray-500 flex items-center gap-3 lg:gap-5">
                            <span>G</span>
                            <span className="text-gray-400">·</span>
                            <span>E</span>
                            <span className="text-gray-400">·</span>
                            <span>P</span>
                          </div>
                          <div className="font-bold tabular-nums flex items-center gap-3 lg:gap-4">
                            <span>{box.g}</span>
                            <span className="text-gray-400">·</span>
                            <span>{box.e}</span>
                            <span className="text-gray-400">·</span>
                            <span>{box.p}</span>
                          </div>
                          <div className="text-[12px] text-gray-500 flex items-center gap-1 lg:gap-3">
                            <span>PJ</span>
                            <span className="text-gray-400">·</span>
                            <span>GF</span>
                            <span className="text-gray-400">·</span>
                            <span>GC</span>
                            <span className="text-gray-400">·</span>
                            <span className>DF</span>
                          </div>
                          <div className="font-bold tabular-nums flex items-center gap-2 lg:gap-4">
                            <span>{box.pj}</span>
                            <span className="text-gray-400">·</span>
                            <span>{box.gf}</span>
                            <span className="text-gray-400">·</span>
                            <span>{box.gc}</span>
                            <span className="text-gray-400">·</span>
                            <span className={dfClass}>{dfTxt}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Versus;

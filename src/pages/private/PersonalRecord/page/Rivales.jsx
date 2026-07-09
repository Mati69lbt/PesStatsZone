// cspell: ignore funtions
import React, { useEffect, useMemo, useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { usePartido } from "../../../../context/PartidoReducer";
import { useUserData } from "../../../../hooks/useUserData";
import useAuth from "../../../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { normalizeName } from "../../../../utils/normalizeName";
import useResumenesMemo from "../../versus/hooks/useResumenesMemo";
import useEstadisticasMemo from "../../versus/hooks/useEstadisticasMemo";
import {
  displayNoMinus,
  getColorSegunResultado,
} from "../../versus/util/funtions";
import { pretty } from "../../match/utils/pretty";

const prettySafe = (s) =>
  typeof s === "string" && s.trim() ? pretty(s) : String(s ?? "");

const emptyBox = () => ({ pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 });

// Las 4 columnas siempre visibles
const COLUMNAS = [
  { key: "general", label: "General" },
  { key: "local", label: "Local" },
  { key: "visitante", label: "Visitante" },
  { key: "neutro", label: "Neutral" },
];

const SORT_FIELDS = [
  { key: "rival", label: "Nombre" },
  { key: "pj", label: "PJ" },
  { key: "g", label: "G" },
  { key: "e", label: "E" },
  { key: "p", label: "P" },
  { key: "gp", label: "G/P" },
  { key: "gf", label: "GF" },
  { key: "gc", label: "GC" },
  { key: "df", label: "DIF" },
];

// Celda de stats reutilizable
const StatsCell = ({ box, rowBg }) => {
  if (box.pj === 0) {
    return (
      <td className={`border px-2 py-2 text-center align-middle ${rowBg}`}>
        <span className="text-xl font-black text-gray-300">—</span>
      </td>
    );
  }

  const df = box.gf - box.gc;
  const gp = (box.g ?? 0) - (box.p ?? 0);
  const cellBg = getColorSegunResultado(box);

  const gpRing =
    gp > 0 ? "ring-emerald-500" : gp < 0 ? "ring-rose-500" : "ring-yellow-400";
  const dfRing =
    df > 0 ? "ring-emerald-500" : df < 0 ? "ring-rose-500" : "ring-yellow-400";

  return (
    <td className={`border px-2 py-1 align-top ${cellBg}`}>
      <div className="w-full leading-tight">
        {/* labels G E P G/P */}
        <div className="text-[12px] text-gray-500 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
          <span>G</span>
          <span className="text-gray-400"></span>
          <span>E</span>
          <span className="text-gray-400"></span>
          <span>P</span>
          <span className="text-gray-400"></span>
          <span>G/P</span>
        </div>
        {/* valores G E P G/P */}
        <div className="font-bold tabular-nums grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
          <span>{box.g}</span>
          <span className="text-gray-400"></span>
          <span>{box.e}</span>
          <span className="text-gray-400"></span>
          <span>{box.p}</span>
          <span className="text-gray-400"></span>
          <span className="justify-self-center">
            <span
              className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${gpRing} h-6 w-6 text-[11px] font-extrabold text-black`}
              title={`G/P = ${gp}`}
            >
              {displayNoMinus(gp)}
            </span>
          </span>
        </div>
        {/* labels PJ GF GC DIF */}
        <div className="mt-0.5 text-[12px] text-gray-500 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
          <span>PJ</span>
          <span className="text-gray-400"></span>
          <span>GF</span>
          <span className="text-gray-400"></span>
          <span>GC</span>
          <span className="text-gray-400"></span>
          <span>DIF</span>
        </div>
        {/* valores PJ GF GC DIF */}
        <div className="font-bold tabular-nums grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center whitespace-nowrap">
          <span>{box.pj}</span>
          <span className="text-gray-400"></span>
          <span>{box.gf}</span>
          <span className="text-gray-400"></span>
          <span>{box.gc}</span>
          <span className="text-gray-400"></span>
          <span className="justify-self-center">
            <span
              className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${dfRing} h-6 w-6 text-[11px] font-extrabold text-black`}
              title={`DIF = ${df}`}
            >
              {df > 0 ? `${df}` : displayNoMinus(df)}
            </span>
          </span>
        </div>
      </div>
    </td>
  );
};

const Rivales = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const lineupsObj = lineupState?.lineups || {};
  const clubs = Object.keys(lineupsObj);
  const lineupsReady = clubs.length > 0;

  const [graceDone, setGraceDone] = useState(false);
  const [lineupsLoadedOnce, setLineupsLoadedOnce] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGraceDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (lineupsReady) setLineupsLoadedOnce(true);
  }, [lineupsReady]);

  // ordenAmbito = columna que se usa para ordenar
  const [ordenAmbito, setOrdenAmbito] = useState("general");
  const [ordenCampo, setOrdenCampo] = useState("rival");
  const [ordenDireccion, setOrdenDireccion] = useState("asc");

  const allMatches = useMemo(
    () =>
      Object.values(lineupsObj).flatMap((club) =>
        Array.isArray(club.matches) ? club.matches : [],
      ),
    [lineupsObj],
  );

  const resumenes = useResumenesMemo(allMatches);
  const estadisticas = useEstadisticasMemo(
    resumenes,
    ordenAmbito,
    ordenCampo,
    ordenDireccion,
  );

  const shouldShowLoading = !lineupsLoadedOnce || !graceDone;
  if (shouldShowLoading)
    return (
      <div className="p-4 text-center text-slate-600">Cargando datos...</div>
    );

  if (!lineupsReady) return <Navigate to="/formacion" replace />;

  const handleSort = (field) => {
    if (field === ordenCampo) {
      setOrdenDireccion((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrdenCampo(field);
      setOrdenDireccion(field === "rival" ? "asc" : "desc");
    }
  };

  return (
    <div className="p-2 max-w-7xl mx-auto">
      <h1 className="mt-2 mb-3 text-center text-2xl font-extrabold tracking-tight text-slate-900">
        🆚 Rivales
      </h1>

      {/* ── ordenar por ámbito ── */}
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">
          Ordenar por:
        </span>
        {COLUMNAS.map((c) => {
          const active = ordenAmbito === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setOrdenAmbito(c.key)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                active
                  ? "bg-sky-600 text-white border-sky-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* ── campo de orden ── */}
      <div className="flex flex-wrap gap-1 justify-center mb-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
        {SORT_FIELDS.map((f) => {
          const active = ordenCampo === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => handleSort(f.key)}
              className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors ${
                active
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {f.label}
              {active ? (ordenDireccion === "asc" ? " ↑" : " ↓") : ""}
            </button>
          );
        })}
      </div>

      {/* ── tabla ── */}
      <div className="flex justify-center">
        <div className="overflow-x-auto rounded-xl border border-slate-400 max-h-[75vh] overflow-y-auto w-fit">
          <table className="w-max text-[11px] md:text-sm border-collapse">
            <thead className="bg-blue-200 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="border px-2 py-2 text-left font-bold max-w-[120px]">
                  Rival
                </th>
                {COLUMNAS.map((c) => (
                  <th
                    key={c.key}
                    className={`border px-2 py-2 text-center font-bold min-w-[110px] ${
                      ordenAmbito === c.key ? "bg-sky-300" : ""
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!estadisticas.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border px-3 py-6 text-center text-gray-500 font-semibold"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                estadisticas.map(([rival, stats], index) => {
                  const rivalText = prettySafe(rival);
                  const rivalKey = normalizeName(rival) || `rival-${index}`;
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";

                  return (
                    <tr key={rivalKey} className={rowBg}>
                      {/* col rival */}
                      <td className="border px-2 py-2 font-semibold text-left align-top max-w-[120px]">
                        <div style={{ lineHeight: "1.2" }}>
                          <span className="text-[12px] font-bold text-slate-800 capitalize block ">
                            {index + 1}. {rivalText}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {clubs
                            .filter((c) =>
                              (lineupsObj[c]?.matches ?? []).some(
                                (m) =>
                                  normalizeName(
                                    m?.rivalName ||
                                      m?.rival ||
                                      m?.opponent ||
                                      "",
                                  ) === normalizeName(rival),
                              ),
                            )
                            .map((c) => (
                              <span
                                key={c}
                                className="text-[12px] font-semibold text-slate-400 capitalize"
                              >
                                ⚽ {prettySafe(c)}
                              </span>
                            ))}
                        </div>
                      </td>

                      {/* 4 columnas de stats */}
                      {COLUMNAS.map((c) => (
                        <StatsCell
                          key={c.key}
                          box={stats[c.key] || emptyBox()}
                          rowBg={rowBg}
                        />
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rivales;

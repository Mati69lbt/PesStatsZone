import React, { useEffect, useState } from "react";
import useResumenTemporada from "./useResumenTemporada";
import { pretty } from "../../match/utils/pretty";
import {
  BloqueHeader,
  FilaDatos,
  emptyTriple,
  getColorSegunResultado,
  metricas,
} from "../utils/Funciones";

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

const CircleValue = ({ value, title }) => {
  const shown = typeof value === "number" ? Math.abs(value) : value;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${ringBySign(
        value,
      )} h-6 w-6 text-[10px] font-extrabold text-black`}
      title={title}
    >
      {shown}
    </span>
  );
};

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
          <div className="flex flex-col items-center leading-none gap-1">
            <span className="text-[10px] tabular-nums font-bold">
              {val.obtenidos} / {val.posibles}
            </span>
            <span className="text-[12px] tabular-nums text-black-500 ">
              {val.efec}%
            </span>
          </div>
        ) : (
          val
        )}
      </td>
    );
  });

const SeasonBlock = ({
  clubKey,
  bucket,
  year,
  matchesForYear,
  mode = "anual",
  openBlock,
  setOpenBlock,
}) => {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);

  const toggleTemporada = (temp) => {
    const key = `${clubKey}-${year}-${temp}`;
    setOpenBlock((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  // matches SOLO de ese año (ya filtrados en el padre)
  const matches = matchesForYear;

  // Resumen por temporada (acá te va a devolver solo ese year)
  const { temporadasOrdenadas, resumenPorTemporada, captainsOrdenados } =
    useResumenTemporada(matches, mode);

  const temporadasDesc = [...(temporadasOrdenadas || [])].sort((a, b) => {
    const yearsA = String(a).match(/\d{4}/g) || [];
    const yearsB = String(b).match(/\d{4}/g) || [];

    const keyA = yearsA.length ? Math.max(...yearsA.map(Number)) : -Infinity;
    const keyB = yearsB.length ? Math.max(...yearsB.map(Number)) : -Infinity;

    return keyB - keyA; // más reciente primero
  });

  // Para TopGoleadores: year actual
  const years = String(year).match(/\d{4}/g) || [String(year)];

  const clubLabel = bucket?.clubName ? bucket.clubName : pretty(clubKey);

  const COL_BLOQUE_W = "w-[60px] max-w-[60px]";
  const COL_BLOQUE_TH = `px-1.5 py-2 ${COL_BLOQUE_W} text-left border-b border-slate-200`;
  const COL_BLOQUE_TD = `px-1.5 py-1 ${COL_BLOQUE_W} text-left text-[10px] uppercase tracking-wide text-slate-600 whitespace-nowrap`;

  return (
    <div className="m-1 space-y-1">
      {temporadasDesc.map((temp) => {
        const rTemp = resumenPorTemporada[temp];
        if (!rTemp) return null;
        const isOpen = openBlock === `${clubKey}-${year}-${temp}`;

        const caps = Array.isArray(captainsOrdenados) ? captainsOrdenados : [];
        const tripleSeason = rTemp.general || emptyTriple();

        return (
          <React.Fragment key={`${clubKey}-${temp}`}>
            <div
              key={`${clubKey}-${temp}`}
              className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleTemporada(temp)}
                className="w-full flex items-center justify-between px-4 py-3 bg-sky-50 text-slate-700 hover:bg-sky-100 transition-colors"
              >
                <span className="font-bold text-sm uppercase tracking-wider">
                  {temp} · {clubLabel}
                </span>
                <span
                  className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "max-h-[3000px] opacity-100 border-t border-slate-200"
                    : "max-h-0 opacity-0 pointer-events-none overflow-hidden"
                }`}
              >
                <div className="flex flex-col gap-3 p-1 w-full">
                  {/* TABLA MOBILE (Sacamos el botón de adentro del thead) */}
                  <div className="lg:hidden w-full overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
                    <table className="w-full text-[10px] border-collapse">
                      {/* ANTES: Había un tr con colSpan={10} vacío que generaba ese espacio feo */}
                      <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm text-[9px] uppercase tracking-tighter">
                        {/* Fila Principal con fondo sutil */}
                        <tr className="bg-sky-50/50 border-b border-sky-100">
                          <th className="px-2 py-2 text-left font-black text-sky-700 w-[70px]">
                            Condición{" "}
                            {/* O la palabra que elijas del listado */}
                          </th>
                          {metricas.map((m) => (
                            <th
                              key={`head-${m}`}
                              className="px-1 py-2 text-center font-bold text-sky-600 border-x border-sky-100/50"
                            >
                              {m}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {/* Temporada - General */}
                        <tr className="border-t border-slate-100 bg-white hover:bg-slate-50/80 transition-colors">
                          <td
                            className={`px-1.5 py-1.5 ${COL_BLOQUE_W} font-semibold text-left text-slate-800 whitespace-nowrap`}
                          >
                            General
                          </td>
                          {renderStatsCells(tripleSeason.General)}
                        </tr>

                        {/* Temporada - Local */}
                        <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                          <td className={COL_BLOQUE_TD}>Local</td>
                          {renderStatsCells(tripleSeason.Local)}
                        </tr>

                        {/* Temporada - Visitante */}
                        <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                          <td className={COL_BLOQUE_TD}>Visitante</td>
                          {renderStatsCells(tripleSeason.Visitante)}
                        </tr>

                        {/* Temporada - Neutral (solo si hay PJ) */}
                        {(tripleSeason?.Neutral?.pj ?? 0) > 0 ? (
                          <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                            <td className={COL_BLOQUE_TD}>Neutral</td>
                            {renderStatsCells(tripleSeason.Neutral)}
                          </tr>
                        ) : null}

                        {/* Bloques por capitán */}
                        {caps.map((cap) => {
                          const tripleCap =
                            rTemp.capitanes?.[cap] || emptyTriple();
                          return (
                            <React.Fragment key={`${temp}-${cap}`}>
                              <tr className="border-t border-slate-200 bg-white hover:bg-slate-50/80 transition-colors">
                                <td
                                  className={`px-1.5 py-1.5 ${COL_BLOQUE_W} font-semibold text-left text-slate-800 whitespace-nowrap truncate`}
                                  title={pretty(cap)}
                                >
                                  {pretty(cap)}
                                </td>
                                {renderStatsCells(tripleCap.General)}
                              </tr>

                              <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                                <td className="px-2 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                                  Local
                                </td>
                                {renderStatsCells(tripleCap.Local)}
                              </tr>

                              <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                                <td className="px-2 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
                                  Visitante
                                </td>
                                {renderStatsCells(tripleCap.Visitante)}
                              </tr>

                              {(tripleCap?.Neutral?.pj ?? 0) > 0 ? (
                                <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                                  <td className="px-2 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
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

                {/* DESKTOP */}
                <div className="hidden lg:block p-2">
                  {/* Función helper para renderizar una tablita */}
                  {(() => {
                    const COLS = [
                      "PJ",
                      "G",
                      "E",
                      "P",
                      "G/P",
                      "GF",
                      "GC",
                      "DF",
                      "%",
                    ];

                    const MiniTabla = ({
                      title,
                      stats,
                      bgHeader = "bg-sky-50",
                    }) => {
                      const g = stats?.g ?? 0;
                      const e = stats?.e ?? 0;
                      const p = stats?.p ?? 0;
                      const pj = stats?.pj ?? 0;
                      const gf = stats?.gf ?? 0;
                      const gc = stats?.gc ?? 0;
                      const df = stats?.df ?? 0;
                      const gp = g - p;
                      const obtenidos = g * 3 + e;
                      const posibles = pj * 3;
                      const efec =
                        posibles > 0
                          ? Math.round((obtenidos / posibles) * 100)
                          : 0;

                      const rowBg =
                        g >= e && g > p
                          ? "bg-green-100"
                          : p > g && p >= e
                            ? "bg-red-100"
                            : "bg-yellow-100";

                      const ringGp =
                        gp > 0
                          ? "ring-green-400"
                          : gp < 0
                            ? "ring-red-400"
                            : "ring-yellow-400";
                      const ringDf =
                        df > 0
                          ? "ring-green-400"
                          : df < 0
                            ? "ring-red-400"
                            : "ring-yellow-400";

                      return (
                        <div className="rounded-lg border border-slate-200 overflow-hidden text-[11px]">
                          <div
                            className={`px-2 py-1 text-center font-bold uppercase tracking-wide text-slate-700 text-[12px] border-b border-slate-200 ${bgHeader}`}
                          >
                            {title}
                          </div>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-500 text-[9px] uppercase">
                                {COLS.map((c) => (
                                  <th key={c} className="px-2 py-1 text-center">
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className={rowBg}>
                                <td className="px-2 py-1.5 text-center font-bold">
                                  {pj}
                                </td>
                                <td className="px-2 py-1.5 text-center font-bold">
                                  {g}
                                </td>
                                <td className="px-2 py-1.5 text-center">{e}</td>
                                <td className="px-2 py-1.5 text-center">{p}</td>
                                <td className="px-2 py-1.5 text-center">
                                  <span
                                    className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${ringGp} w-6 h-6 text-[10px] font-extrabold`}
                                  >
                                    {Math.abs(gp)}
                                  </span>
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  {gf}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  {gc}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <span
                                    className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${ringDf} w-6 h-6 text-[10px] font-extrabold`}
                                  >
                                    {Math.abs(df)}
                                  </span>
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <div
                                    className="flex flex-col items-center leading-none gap-1
                                  "
                                  >
                                    <span className="font-bold text-[10px]">
                                      {obtenidos} / {posibles}
                                    </span>
                                    <span className="text-[12px] text-slate-500">
                                      {efec}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    };

                    const FilaCuatro = ({ label, triple, isClub = false }) => (
                      <div className="mb-2">
                        <div className="grid grid-cols-4 gap-2">
                          <MiniTabla
                            title={
                              isClub ? `${clubLabel} · ${temp}` : pretty(label)
                            }
                            stats={triple?.General}
                            bgHeader="bg-sky-50"
                          />
                          <MiniTabla
                            title="Local"
                            stats={triple?.Local}
                            bgHeader="bg-green-50"
                          />
                          <MiniTabla
                            title="Visitante"
                            stats={triple?.Visitante}
                            bgHeader="bg-orange-50"
                          />
                          <MiniTabla
                            title="Neutral"
                            stats={triple?.Neutral}
                            bgHeader="bg-slate-50"
                          />
                        </div>
                      </div>
                    );

                    return (
                      <div>
                        {/* Fila del club */}
                        <FilaCuatro
                          triple={rTemp.general}
                          isClub
                          label={clubLabel}
                        />

                        {/* Filas por capitán */}
                        {caps.map((cap) => {
                          const tripleCap =
                            rTemp.capitanes?.[cap] || emptyTriple();
                          if ((tripleCap?.General?.pj ?? 0) === 0) return null;
                          return (
                            <FilaCuatro
                              key={cap}
                              label={cap}
                              triple={tripleCap}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SeasonBlock;

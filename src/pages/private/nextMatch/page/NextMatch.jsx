import React, { useMemo, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useClubData } from "../../../../hooks/useClubData";
import { normalizeName } from "../../../../utils/normalizeName";
import { prettySafe } from "../../campeonatos/util/funtions";
import { useRivals } from "../hooks/useRival";
import { useFilteredMatches } from "../hooks/useFilteredMatches";
import { useOrderedMatches } from "../hooks/useOrderedMatches";
import { useResumen } from "../hooks/useResumen";
import {
  badgeClass,
  barColor,
  cardBorderClass,
  formatDate,
  getOutcome,
  getScoreDisplay,
  getTorneoDisplay,
  joinScorers,
  numColor,
  pillBg,
  prettyCondition,
} from "../utils/utils";
import { pretty } from "../../match/utils/pretty";
import { goleadoresClub, goleadoresRival } from "../hooks/useGoleadores";
import TablaGoleadores from "../utils/TablaGoleadores";
import { displayNoMinus } from "../../versus/util/funtions";
import usePlayed from "../hooks/usePlayed";
import useclubRowsWithPJ from "../hooks/useclubRowsWithPJ";
import { Loading } from "notiflix/build/notiflix-loading-aio";

const ResumenCard = ({ title, data }) => (
  <div className="relative rounded-2xl border border-slate-400 bg-white p-1">
    <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wide text-sky-600 z-10">
      {title}
    </label>

    <div className="grid grid-cols-8 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      <div>PJ</div>
      <div>G</div>
      <div>E</div>
      <div>P</div>
      <div>G/P</div>
      <div>GF</div>
      <div>GC</div>
      <div>DIF</div>
    </div>

    <div className="grid grid-cols-8 gap-2 text-center text-sm font-bold text-slate-900">
      <div className="rounded-xl border px-2 py-1 text-center">
        {data.total}
      </div>
      <div className="rounded-xl border px-2 py-1 text-center">{data.g}</div>
      <div className="rounded-xl border px-2 py-1 text-center">{data.e}</div>
      <div className="rounded-xl border px-2 py-1 text-center">{data.p}</div>
      <div
        className={`rounded-xl border px-2 py-1 ${pillBg(data.gp)} ${numColor(data.gp)}`}
      >
        {displayNoMinus(data.gp)}
      </div>
      <div className="rounded-xl border px-2 py-1">{data.gf}</div>
      <div className="rounded-xl border px-2 py-1">{data.gc}</div>
      <div
        className={`rounded-xl border px-2 py-1 ${pillBg(data.dif)} ${numColor(data.dif)}`}
      >
        {displayNoMinus(data.dif)}
      </div>
    </div>
  </div>
);

const NextMatch = () => {
  const { hasLineupsLoaded, clubs, activeClub, lineupState } = useClubData();
  if (!hasLineupsLoaded) {
    return (
      <div className="p-6 text-center text-slate-500">Cargando datos...</div>
    );
  }

  const [selectedClub, setSelectedClub] = useState(activeClub);

  useEffect(() => {
    if (selectedClub) return;

    if (activeClub) setSelectedClub(activeClub);
    else if (clubs.length) setSelectedClub(clubs[0]);
  }, [selectedClub, activeClub, clubs]);

  if (!selectedClub) {
    return <Navigate to="/formacion" replace />;
  }

  const clubKey = normalizeName(selectedClub);
  const bucket = lineupState?.lineups?.[clubKey] || null;
  const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];
  const torneosConfig = bucket?.torneosConfig || {};

  const [selectedRival, setSelectedRival] = useState("");

  useEffect(() => {
    setSelectedRival(""); // al cambiar de club, arrancamos sin rival
  }, [clubKey]);

  const rivals = useRivals(matches);

  const filteredMatches = useFilteredMatches(matches, selectedRival);
  const orderedMatches = useOrderedMatches(filteredMatches);
  const resumen = useResumen(filteredMatches);

  const clubRows = goleadoresClub(orderedMatches);
  const rivalRows = goleadoresRival(orderedMatches);

  const pjByPlayer = usePlayed(filteredMatches);
  const clubRowsWithPJ = useclubRowsWithPJ(clubRows, pjByPlayer);

  useEffect(() => {
    if (resumen.total === 0) {
      Loading.circle("Cargando...");
    } else {
      Loading.remove();
    }

    return () => Loading.remove();
  }, [resumen.total]);

  return (
    <div className="p-2 sm:p-4 max-w-screen-2xl mx-auto overflow-hidden">
      {/* Controles */}
      <div className="mb-2 bg-white p-2 shadow-sm ">
        <div className="flex flex-col gap-3 mb-2 mt-2">
          {/* h1 solo en mobile (arriba) */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 text-center sm:hidden">
            ⚔️ NextMatch
          </h1>

          {/* fila: Club — h1 (solo desktop) — Rival */}
          <div className="flex flex-row items-center justify-evenly">
            {/* Select Club */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wide text-sky-600 z-10">
                Club
              </label>
              <select
                className="w-max rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 font-semibold text-slate-700"
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

            {/* h1 solo en desktop (centro) */}
            <h1 className="hidden sm:block text-2xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              ⚔️ NextMatch
            </h1>

            {/* Select Rival */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wide text-sky-600 z-10 transition-all">
                Rival
              </label>
              <select
                className="w-max rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 font-semibold text-slate-700 appearance-none cursor-pointer"
                value={selectedRival}
                onChange={(e) => setSelectedRival(e.target.value)}
              >
                <option value="">Todos los rivales</option>
                {rivals.map((r) => (
                  <option key={normalizeName(r)} value={r}>
                    {prettySafe(r)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ${resumen.total === 0 ? "hidden" : ""} */}

        {selectedRival ? (
          <div
            className={`m-1 rounded-2xl bg-white p-2 text-center ${resumen.total === 0 ? "hidden" : ""} `}
          >
            <div
              className={`rounded-2xl border px-4 py-3 text-xl font-extrabold tracking-tight text-slate-900 ${pillBg(resumen.gp)}`}
            >
              {pretty(selectedRival)}
            </div>
          </div>
        ) : null}

        {/* Fila 2: Resumen */}
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-evenly  gap-2">
        <div
          className={`rounded-2xl border border-slate-200 bg-slate-200 h-max p-1 flex flex-col gap-2 ${resumen.total === 0 ? "hidden" : ""}`}
        >
          <ResumenCard title="General" data={resumen} />
          <ResumenCard title="Local" data={resumen.local} />
          <ResumenCard title="Visitante" data={resumen.visitante} />
          {resumen.neutro.total > 0 && (
            <ResumenCard title="Neutral" data={resumen.neutro} />
          )}
        </div>

        {selectedRival && (
          <div className="flex flex-col gap-2 lg:flex-row">
            <TablaGoleadores
              title={prettySafe(clubKey)}
              rows={clubRowsWithPJ}
            />

            <TablaGoleadores
              title={prettySafe(selectedRival)}
              rows={rivalRows}
              hidePJ
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {orderedMatches.map((m) => {
          const outcome = getOutcome(m);
          return (
            <div
              key={m?.id ?? `${m?.fecha}-${m?.rival}-${m?.createdAt ?? ""}`}
              className={`rounded-2xl border bg-white p-2 shadow-sm flex flex-col gap-2 ${cardBorderClass(m)}`}
            >
              {/* Renglón 1: 2 Columnas Balanceadas */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                {/* 1. TORNEO: Ocupa el espacio sobrante (izquierda) */}
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2 py-1 max-w-full">
                    <span className="text-[10px] opacity-70">🏆</span>
                    <span className="text-[12px] font-black uppercase tracking-tight text-slate-500">
                      {getTorneoDisplay(m, torneosConfig)}
                    </span>
                  </div>
                </div>

                {/* 2. INFO DER: Fecha y Resultado agrupados (derecha) */}
                <div className="flex items-center gap-2">
                  {/* Fecha */}
                  <div className="flex items-center gap-1 text-[12px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                    <span>📅</span>
                    <span className="tabular-nums">{formatDate(m?.fecha)}</span>
                  </div>

                  {/* Resultado Badge */}
                </div>
              </div>

              {/* Renglón 2: Condición y Capitán */}
              <div className="flex items-center justify-evenly">
                <span
                  className={`rounded-lg border bg-white px-2 py-0.5 text-[10px] font-black uppercase ${cardBorderClass(m)}`}
                >
                  {prettyCondition(m?.condition)}
                </span>
                <div className="text-[11px] font-bold text-slate-400 rounded-md bg-slate-100/80 px-2 py-0.5 ">
                  CAP:{" "}
                  <span className="text-slate-800">
                    {prettySafe(m?.captain)}
                  </span>
                </div>
                <span
                  className={`
        text-[12px] font-black uppercase tracking-tight px-2 py-1 rounded-md border
        shadow-sm transition-all
        ${badgeClass(outcome)}
      `}
                >
                  {outcome}
                </span>
              </div>

              {/* BLOQUE UNIFICADO: MARCADOR (IZQ) Y GOLEADORES (DER) */}
              <div className="grid grid-cols-2 gap-2 items-stretch">
                {/* COLUMNA IZQUIERDA: MARCADOR TIPO TV */}
                {m?.resultMatch &&
                  (() => {
                    const { left, right } = getScoreDisplay(m);
                    const isLocalOrNeutral =
                      m?.condition === "local" || m?.condition === "neutro";

                    const topTeam = isLocalOrNeutral ? m?.club : m?.rival;
                    const bottomTeam = isLocalOrNeutral ? m?.rival : m?.club;

                    return (
                      <div
                        className={`flex flex-col justify-center rounded-xl border-2 bg-white p-2 shadow-sm ${cardBorderClass(m)}`}
                      >
                        <div className="flex flex-col gap-1">
                          {/* Fila Superior */}
                          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                            <span className="text-[12px] font-black uppercase tracking-tighter text-slate-700  ml-2 ">
                              {prettySafe(topTeam)}
                            </span>
                            <span
                              className={`text-xl mr-2 font-black tabular-nums ${numColor(getOutcome(m) === "GANADO" ? 1 : getOutcome(m) === "PERDIDO" ? -1 : 0)}`}
                            >
                              {left}
                            </span>
                          </div>

                          <div
                            className={`h-[10px] w-full rounded-xl bg-current ${barColor(getOutcome(m) === "GANADO" ? 1 : getOutcome(m) === "PERDIDO" ? -1 : 0)}`}
                          />

                          {/* Fila Inferior */}
                          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                            <span className="text-[12px] font-black uppercase tracking-tighter text-slate-700 ml-2">
                              {prettySafe(bottomTeam)}
                            </span>
                            <span
                              className={`text-xl mr-2 font-black tabular-nums ${numColor(getOutcome(m) === "GANADO" ? 1 : getOutcome(m) === "PERDIDO" ? -1 : 0)}`}
                            >
                              {right}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* COLUMNA DERECHA: GOLEADORES */}
                <div className="flex flex-col gap-1.5">
                  {/* Goleadores Club Activo */}
                  <div className="rounded-lg bg-slate-50/50 p-2 border border-slate-100 flex-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
                      {m?.condition === "local" || m?.condition === "neutro"
                        ? prettySafe(m?.club)
                        : prettySafe(m?.rival)}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">
                      {m?.condition === "local" || m?.condition === "neutro"
                        ? pretty(joinScorers(m?.goleadoresActiveClub)) || "—"
                        : pretty(joinScorers(m?.goleadoresRivales)) || "—"}
                    </div>
                  </div>

                  {/* Goleadores Rival */}
                  <div className="rounded-lg bg-slate-50/50 p-2 border border-slate-100 flex-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
                      {m?.condition === "local" || m?.condition === "neutro"
                        ? prettySafe(m?.rival)
                        : prettySafe(m?.club)}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">
                      {m?.condition === "local" || m?.condition === "neutro"
                        ? pretty(joinScorers(m?.goleadoresRivales)) || "—"
                        : pretty(joinScorers(m?.goleadoresActiveClub)) || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NextMatch;

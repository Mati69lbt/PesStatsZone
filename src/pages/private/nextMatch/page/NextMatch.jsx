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
    <div className="p-1 sm:p-4 max-w-screen-2xl mx-auto overflow-hidden">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h1 className="mt-2 mb-2 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          ⚔️ NextMatch
        </h1>
      </div>
      {/* Controles */}
      <div className="mb-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {/* Fila 1: Selects (izq/der) */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="text-left">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Club
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
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

          <div className="text-left sm:text-right">
            <label className="mb-1 block text-sm font-medium text-slate-700 sm:text-right">
              Rival
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              value={selectedRival}
              onChange={(e) => setSelectedRival(e.target.value)}
            >
              <option value="">Todos</option>
              {rivals.map((r) => (
                <option key={normalizeName(r)} value={r}>
                  {prettySafe(r)}
                </option>
              ))}
            </select>
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
        <div
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 p-1 ${resumen.total === 0 ? "hidden" : ""}`}
        >
          {/* Card: GENERAL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-1">
            {/* Header */}
            <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <div>PJ</div>
              <div>G</div>
              <div>E</div>
              <div>P</div>
              <div>G/P</div>
              <div>GF</div>
              <div>GC</div>
              <div>DIF</div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-8 gap-2 text-center text-sm font-bold text-slate-900">
              <div className="rounded-xl border px-2 py-1 text-center">
                {resumen.total}
              </div>
              <div className="rounded-xl border px-2 py-1 text-center">
                {resumen.g}
              </div>
              <div className="rounded-xl border px-2 py-1 text-center">
                {resumen.e}
              </div>
              <div className="rounded-xl border px-2 py-1 text-center">
                {resumen.p}
              </div>

              <div
                className={`rounded-xl border px-2 py-1 ${pillBg(resumen.gp)} ${numColor(resumen.gp)}`}
              >
                {displayNoMinus(resumen.gp)}
              </div>

              <div className="rounded-xl border px-2 py-1">{resumen.gf}</div>
              <div className="rounded-xl border px-2 py-1">{resumen.gc}</div>

              <div
                className={`rounded-xl border px-2 py-1 ${pillBg(resumen.dif)} ${numColor(resumen.dif)}`}
              >
                {displayNoMinus(resumen.dif)}
              </div>
            </div>
            <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              General
            </div>
          </div>

          {/* LOCAL + VISITANTE */}
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {/* Card: LOCAL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-1">
              <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
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
                <div className="rounded-xl border px-2 py-1">
                  {resumen.local.total}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.local.g}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.local.e}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.local.p}
                </div>

                <div
                  className={`rounded-xl border px-2 py-1 ${pillBg(resumen.local.gp)} ${numColor(resumen.local.gp)}`}
                >
                  {displayNoMinus(resumen.local.gp)}
                </div>

                <div className="rounded-xl border px-2 py-1">
                  {resumen.local.gf}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.local.gc}
                </div>

                <div
                  className={`rounded-xl border px-2 py-1 ${pillBg(resumen.local.dif)} ${numColor(resumen.local.dif)}`}
                >
                  {displayNoMinus(resumen.local.dif)}
                </div>
              </div>
              <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Local
              </div>
            </div>

            {/* Card: VISITANTE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-1">
              <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
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
                <div className="rounded-xl border px-2 py-1">
                  {resumen.visitante.total}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.visitante.g}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.visitante.e}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.visitante.p}
                </div>

                <div
                  className={`rounded-xl border px-2 py-1 ${pillBg(resumen.visitante.gp)} ${numColor(resumen.visitante.gp)}`}
                >
                  {displayNoMinus(resumen.visitante.gp)}
                </div>

                <div className="rounded-xl border px-2 py-1">
                  {resumen.visitante.gf}
                </div>
                <div className="rounded-xl border px-2 py-1">
                  {resumen.visitante.gc}
                </div>

                <div
                  className={`rounded-xl border px-2 py-1 ${pillBg(resumen.visitante.dif)} ${numColor(resumen.visitante.dif)}`}
                >
                  {displayNoMinus(resumen.visitante.dif)}
                </div>
              </div>
              <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Visitante
              </div>
            </div>

            {resumen.neutro.total > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-1">
                <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
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
                  <div className="rounded-xl border px-2 py-1">
                    {resumen.neutro.total}
                  </div>
                  <div className="rounded-xl border px-2 py-1">
                    {resumen.neutro.g}
                  </div>
                  <div className="rounded-xl border px-2 py-1">
                    {resumen.neutro.e}
                  </div>
                  <div className="rounded-xl border px-2 py-1">
                    {resumen.neutro.p}
                  </div>

                  <div
                    className={`rounded-xl border px-2 py-1 ${pillBg(resumen.neutro.gp)} ${numColor(resumen.neutro.gp)}`}
                  >
                    {displayNoMinus(resumen.neutro.gp)}
                  </div>

                  <div className="rounded-xl border px-2 py-1">
                    {resumen.neutro.gf}
                  </div>
                  <div className="rounded-xl border px-2 py-1">
                    {resumen.neutro.gc}
                  </div>

                  <div
                    className={`rounded-xl border px-2 py-1 ${pillBg(resumen.neutro.dif)} ${numColor(resumen.neutro.dif)}`}
                  >
                    {displayNoMinus(resumen.neutro.dif)}
                  </div>
                </div>

                <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Neutral
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRival && (
        <div
          className={`mb-1 grid grid-cols-2 gap-2 ${resumen.total === 0 ? "hidden" : ""} `}
        >
          <div className="min-w-0">
            <TablaGoleadores
              title={prettySafe(clubKey)}
              rows={clubRowsWithPJ}
            />
          </div>
          <div className="min-w-0">
            <TablaGoleadores
              title={prettySafe(selectedRival)}
              rows={rivalRows}
              hidePJ
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

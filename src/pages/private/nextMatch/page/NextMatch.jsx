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

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          ⚔️ NextMatch
        </h1>
      </div>

      {/* Controles */}
      <div className="mb-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                  {prettySafe(c)}
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
                <option key={r} value={r}>
                  {prettySafe(r)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedRival ? (
          <div className="m-1 rounded-2xl bg-white p-2 text-center">
            <div
              className={`rounded-2xl border px-4 py-3 text-xl font-extrabold tracking-tight text-slate-900 ${pillBg(resumen.gp)}`}
            >
              {prettySafe(selectedRival)}
            </div>
          </div>
        ) : null}

        {/* Fila 2: Resumen */}
        <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-1">
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
          </div>
        </div>
      </div>

      {selectedRival && (
        <div className="mb-1 grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <TablaGoleadores
              title={prettySafe(activeClub)}
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

      {/* Listado */}
      {orderedMatches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
          No hay partidos para mostrar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orderedMatches.map((m) => {
            const outcome = getOutcome(m);
            const { left, right } = getScoreDisplay(m);

            return (
              <div
                key={m?.id ?? `${m?.fecha}-${m?.rival}-${m?.createdAt ?? ""}`}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${cardBorderClass(m)}`}
              >
                {/* header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* Línea 1: Liga + Fecha + Condición */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                        {getTorneoDisplay(m, torneosConfig)}
                      </span>

                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        {formatDate(m?.fecha)}
                      </span>

                      <span
                        className={`rounded-full border bg-white px-2.5 py-1 ${cardBorderClass(m)}`}
                      >
                        {prettyCondition(m?.condition)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                        <span className="font-semibold text-slate-500">
                          Captain:
                        </span>{" "}
                        <span className="font-semibold text-slate-800">
                          {prettySafe(m?.captain)}
                        </span>
                      </span>
                    </div>

                    {!selectedRival ? (
                      <div className="mt-2 flex items-center justify-center">
                        <div className="truncate text-base font-extrabold tracking-wide text-slate-900 sm:text-lg">
                          {prettySafe(m?.rival)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div
                    className={
                      "shrink-0 rounded-xl border px-3 py-2 text-center " +
                      badgeClass(outcome)
                    }
                  >
                    <div className="text-xs font-semibold">{outcome}</div>
                    <div className="text-lg font-extrabold tracking-tight">
                      {left} - {right}
                    </div>
                  </div>
                </div>

                {/* info */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500">
                      Goleadores {prettySafe(m?.club)}
                    </div>
                    <div className="text-slate-800">
                      {pretty(joinScorers(m?.goleadoresActiveClub))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500">
                      Goleadores rival
                    </div>
                    <div className="text-slate-800">
                      {joinScorers(m?.goleadoresRivales)}
                    </div>
                  </div>
                </div>
                {/* extras lindos */}
                <div className="flex flex-wrap gap-2 pt-1 text-center">
                  {m?.resultMatch ? (
                    <span
                      className={`w-full rounded-xl border bg-white px-3 py-2 text-xs text-slate-600 ${cardBorderClass(m)}`}
                    >
                      {pretty(m.resultMatch)}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NextMatch;

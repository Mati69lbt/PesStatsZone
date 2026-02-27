import React, { useMemo } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import {
  getOutcome,
  numColor,
  pillBg,
} from "../../../private/nextMatch/utils/utils";

const buildResumen = (matches, scope = "all") => {
  const blank = () => ({
    total: 0,
    g: 0,
    e: 0,
    p: 0,
    gp: 0,
    gf: 0,
    gc: 0,
    dif: 0,
    pts: 0,
    maxPts: 0,
    pct: 0,
  });

  const acc = blank();

  const filtered = matches.filter((m) => {
    if (scope === "local") return m?.condition === "local";
    if (scope === "visitante") return m?.condition === "visitante";
    return m?.condition === "local" || m?.condition === "visitante"; // general (sin neutro)
  });

  for (const m of filtered) {
    acc.total += 1;

    const o = getOutcome(m);
    if (o === "GANADO") {
      acc.g += 1;
      acc.pts += 3;
    } else if (o === "EMPATADO") {
      acc.e += 1;
      acc.pts += 1;
    } else {
      acc.p += 1;
    }

    acc.gf += Number(m?.golFavor ?? 0);
    acc.gc += Number(m?.golContra ?? 0);
  }

  acc.gp = acc.g - acc.p;
  acc.dif = acc.gf - acc.gc;
  acc.maxPts = acc.total * 3;
  acc.pct = acc.maxPts ? Math.round((acc.pts / acc.maxPts) * 100) : 0;

  return acc;
};

const PersonalRecord = () => {
  const { state: lineupState } = useLineups();

  const allMatches = useMemo(() => {
    const lineups = lineupState?.lineups ?? {};

    return Object.entries(lineups).flatMap(([clubKey, bucket]) => {
      const label = bucket?.label ?? clubKey;
      const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];

      return matches
        .filter((m) => m?.condition === "local" || m?.condition === "visitante") // ✅ ignora neutro
        .map((m) => ({
          ...m,
          __clubKey: clubKey,
          __clubLabel: label,
        }));
    });
  }, [lineupState]);

  const resumenGeneral = useMemo(
    () => buildResumen(allMatches, "all"),
    [allMatches],
  );
  const resumenLocal = useMemo(
    () => buildResumen(allMatches, "local"),
    [allMatches],
  );
  const resumenVisitante = useMemo(
    () => buildResumen(allMatches, "visitante"),
    [allMatches],
  );

  const resumen = useMemo(() => buildResumen(allMatches), [allMatches]);

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-center mb-3">
        📌 Personal Record
      </h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-9 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <div>Partidos Jugados</div>
          <div>Ganados</div>
          <div>Empatados</div>
          <div>Perdidos</div>
          <div>Ganados/Perdidos</div>
          <div>Goles a Favor</div>
          <div>Goles en Contra</div>
          <div>DIFerencia de Goles</div>
          <div>PTS / EFEC.</div>
        </div>

        <div className="space-y-3">
          <ResumenBlock title="General" r={resumenGeneral} />
          <ResumenBlock title="Local" r={resumenLocal} />
          <ResumenBlock title="Visitante" r={resumenVisitante} />
        </div>
      </div>
    </div>
  );
};

export default PersonalRecord;

const Stat = ({ label, value, tone, wide, compact = false }) => {
  const isDiff = tone === "diff";
  const num = typeof value === "number" ? value : null;

  return (
    <div
      className={[
        "min-w-0 rounded-xl border px-2 py-2 text-center bg-white",
        wide ? "col-span-3 sm:col-span-4 md:col-span-1" : "",
        isDiff && num !== null ? `${pillBg(num)} ${numColor(num)}` : "",
      ].join(" ")}
    >
      <div className="md:hidden text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div
        className={[
          "min-w-0 font-bold text-slate-900",
          compact ? "text-[11px] leading-tight" : "text-sm",
          // clave: permitir que el texto no rompa el layout
          "truncate",
        ].join(" ")}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </div>
    </div>
  );
};

const ResumenBlock = ({ title, r }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
    <div className="text-sm font-extrabold text-slate-900 m-2">{title}</div>

    {/* MOBILE: 2 filas */}
    <div className="md:hidden space-y-2">
      <div className="grid grid-cols-5 gap-2">
        <Stat label="PJ" value={r.total} />
        <Stat label="G" value={r.g} />
        <Stat label="E" value={r.e} />
        <Stat label="P" value={r.p} />
        <Stat label="G/P" value={r.gp} tone="diff" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat label="GF" value={r.gf} />
        <Stat label="GC" value={r.gc} />
        <Stat label="DIF" value={r.dif} tone="diff" />
        <Stat
          label="PTS/EFEC"
          value={`${r.pts} / ${r.maxPts} ${r.pct}%`}
          compact
        />
      </div>
    </div>

    {/* DESKTOP: 1 fila */}
    <div className="hidden md:grid md:grid-cols-9 gap-2">
      <Stat label="PJ" value={r.total} />
      <Stat label="G" value={r.g} />
      <Stat label="E" value={r.e} />
      <Stat label="P" value={r.p} />
      <Stat label="G/P" value={r.gp} tone="diff" />
      <Stat label="GF" value={r.gf} />
      <Stat label="GC" value={r.gc} />
      <Stat label="DIF" value={r.dif} tone="diff" />
      <Stat label="PTS/EFEC" value={`${r.pts} / ${r.maxPts} ${r.pct}%`} compact />
    </div>
  </div>
);

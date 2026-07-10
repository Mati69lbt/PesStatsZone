import React from "react";
import { pretty } from "../../match/utils/pretty";

// ── builder ───────────────────────────────────────────────────────────────────
export const buildForma = (matches, cantidad = 15) => {
  return [...matches]
    .filter((m) => m?.fecha)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, cantidad);
};

// ── helpers ───────────────────────────────────────────────────────────────────
const getOutcome = (m) => {
  const f = String(m?.final || "")
    .toLowerCase()
    .trim();
  if (f === "ganado") return "g";
  if (f === "perdido") return "p";
  if (f === "empatado") return "e";
  const gf = Number(m?.golFavor || 0);
  const gc = Number(m?.golContra || 0);
  return gf > gc ? "g" : gf < gc ? "p" : "e";
};

const OUTCOME_CFG = {
  g: {
    bg: "bg-emerald-500",
    text: "text-white",
    label: "G",
    ring: "ring-emerald-600",
  },
  e: {
    bg: "bg-amber-400",
    text: "text-white",
    label: "E",
    ring: "ring-amber-500",
  },
  p: {
    bg: "bg-rose-500",
    text: "text-white",
    label: "P",
    ring: "ring-rose-600",
  },
};

const fmtFecha = (f) => {
  if (!f) return "";
  const d = new Date(f);
  if (isNaN(d)) return f;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const stripYear = (name = "") =>
  name
    .toString()
    .replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, "")
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

// ── Badge individual ──────────────────────────────────────────────────────────
const MatchBadge = ({ m, idx, total }) => {
  const outcome = getOutcome(m);
  const cfg = OUTCOME_CFG[outcome];
  const gf = Number(m?.golFavor || 0);
  const gc = Number(m?.golContra || 0);
  const isLocal = m?.condition === "local" || m?.condition === "neutro";
  const score = isLocal ? `${gf}-${gc}` : `${gc}-${gf}`;
  const rival = pretty(m?.rival || m?.rivalName || "?");
  const torneo = stripYear(m?.torneoDisplay || m?.torneoName || "");

  return (
    <div className="flex flex-col items-center gap-1 group relative">
      {/* número de partido (del más reciente al más viejo) */}
      <span className="text-[9px] text-slate-400 font-bold">{total - idx}</span>

      {/* badge */}
      <div
        className={`
          ${cfg.bg} ${cfg.text}
          w-9 h-9 rounded-full flex flex-col items-center justify-center
          ring-2 ${cfg.ring} shadow-sm cursor-default
          transition-transform hover:scale-110
        `}
        title={`${fmtFecha(m?.fecha)} · ${rival} · ${score} · ${torneo}`}
      >
        <span className="text-[10px] font-black leading-none">{cfg.label}</span>
        <span className="text-[9px] font-bold leading-none opacity-90">
          {score}
        </span>
      </div>

      {/* rival debajo */}
      <span className="text-[9px] text-slate-500 font-semibold max-w-[36px] text-center leading-tight truncate">
        {rival}
      </span>
    </div>
  );
};

// ── Barra de forma (racha visual) ─────────────────────────────────────────────
const FormaBar = ({ matches }) => {
  if (!matches.length) return null;

  // última racha activa
  const ultimo = getOutcome(matches[0]);
  let rachaActual = 0;
  for (const m of matches) {
    if (getOutcome(m) === ultimo) rachaActual++;
    else break;
  }

  const cfg = OUTCOME_CFG[ultimo];
  const labels = { g: "ganados", e: "empatados", p: "perdidos" };

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
      <span
        className={`${cfg.bg} ${cfg.text} px-2 py-0.5 rounded-full text-[10px] font-black`}
      >
        {rachaActual} {labels[ultimo]} seguidos
      </span>
      <span className="text-slate-300">·</span>
      <span>
        {matches.filter((m) => getOutcome(m) === "g").length}G{" "}
        {matches.filter((m) => getOutcome(m) === "e").length}E{" "}
        {matches.filter((m) => getOutcome(m) === "p").length}P en los últimos{" "}
        {matches.length}
      </span>
    </div>
  );
};

// ── componente principal ──────────────────────────────────────────────────────
const FormaReciente = ({ matches = [], cantidad = 15 }) => {
  const forma = buildForma(matches, cantidad);

  if (!forma.length) {
    return (
      <p className="text-center text-sm text-slate-400 italic py-4">
        Sin datos
      </p>
    );
  }

  return (
    <div>
      <FormaBar matches={forma} />

      {/* badges de izquierda a derecha = más viejo a más reciente */}
      <div className="flex flex-wrap gap-2">
        {[...forma].reverse().map((m, idx) => (
          <MatchBadge
            key={m.id || `${m.fecha}-${idx}`}
            m={m}
            idx={forma.length - 1 - idx}
            total={forma.length}
          />
        ))}
      </div>

      {/* leyenda */}
      <div className="flex gap-3 mt-3 text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Ganado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400  inline-block" />
          Empate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500   inline-block" />
          Perdido
        </span>
        <span className="ml-auto text-slate-300">
          ← más viejo · más reciente →
        </span>
      </div>
    </div>
  );
};

export default FormaReciente;

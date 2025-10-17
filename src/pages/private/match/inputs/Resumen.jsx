// cspell: ignore condicion hattrick autogol
import React from "react";
import { pretty } from "../utils/pretty";

function goalsFromFlags(g) {
  return (
    (g.gol ? 1 : 0) + (g.doblete ? 2 : 0) + (g.triplete || g.hattrick ? 3 : 0)
  );
}

function fmtScorers(list) {
  // excluimos expulsados de la lista de goleadores
  const arr = (Array.isArray(list) ? list : []).filter(
    (g) => !(g.expulsion || g.expulsado)
  );
  if (!arr.length) return "—";
  // devolvemos un array para poder estilizar cada chip
  return arr.map((g) => {
    const goles = goalsFromFlags(g);
    const sufijo = goles > 0 ? ` (${goles})` : "";
    return `${pretty(g.name)}${sufijo}`;
  });
}

function fmtExpulsados(list) {
  const expulsados = list?.filter((g) => g.expulsion || g.expulsado) || [];
  if (!expulsados.length) return [];
  return expulsados.map((g) => pretty(g.name));
}

const Chips = ({ items, tone = "slate" }) => {
  if (!items || items === "—" || items.length === 0) {
    return <span className="text-slate-400">—</span>;
  }
  const base =
    tone === "red"
      ? "bg-red-50 text-red-700 ring-1 ring-red-200"
      : "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((txt, i) => (
        <span
          key={`${txt}-${i}`}
          className={`px-2.5 py-1 rounded-full text-sm ${base}`}
        >
          {txt}
        </span>
      ))}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="space-y-1.5">
    <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
      {title}
    </div>
    {children}
  </div>
);

const Resumen = ({ state, activeClub }) => {
  const rivalName = state?.rival || "Rival";

  const torneoDisplay =
    state?.torneoDisplay || state?.torneoName || state?.torneo || "";

  // propios (del club activo)
  const ownAll = state?.goleadoresActiveClub || [];
  const own = ownAll.filter((g) => g.activeClub === activeClub);

  // rivales
  const rivals = state?.goleadoresRivales || [];

  // goles
  const baseOwnGoals = own.reduce((acc, g) => acc + goalsFromFlags(g), 0);
  const rivalGoals = rivals.reduce((acc, g) => acc + goalsFromFlags(g), 0);

  const ownGoalsFromOG = (rivals || []).filter(
    (g) => g?.enContra || g?.autogol || g?.og || g?.ogContra
  ).length;
  const ownGoals = baseOwnGoals + ownGoalsFromOG;

  // condición
  const condition = (
    state?.condition ||
    state?.condicion ||
    "neutro"
  ).toLowerCase();

  // línea de resultado (solo texto)
  const resultado =
    condition === "visitante"
      ? `${rivalName} ${rivalGoals} - ${ownGoals} ${pretty(activeClub)}`
      : `${pretty(activeClub)} ${ownGoals} - ${rivalGoals} ${rivalName}`;

  // textos de incidencias (como arrays para chips)
  const propiosArr = (own || [])
    .filter((g) => goalsFromFlags(g) > 0) // solo goleadores reales (>0)
    .map((g) => {
      const goles = goalsFromFlags(g);
      const label =
        g.isOwnGoal || g.name === "__OG__" ? "Gol en contra" : pretty(g.name);
      return goles > 1 ? `${label} (${goles})` : label;
    });
    
  // mostramos al rival con sufijo " (EC)" si fue en contra
  const rivalesArr = (Array.isArray(rivals) ? rivals : [])
    .filter((g) => !(g.expulsion || g.expulsado))
    .map((g) => {
      const goles = goalsFromFlags(g);
      const sufGoles = goles > 0 ? ` (${goles})` : "";
      const sufOG =
        g?.enContra || g?.autogol || g?.og || g?.ogContra ? " (EC)" : "";
      return `${pretty(g.name)}${sufGoles}${sufOG}`;
    });
  const expPropiosArr = fmtExpulsados(own);
  const expRivalesArr = fmtExpulsados(rivals);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
      {/* Torneo arriba */}
      {torneoDisplay ? (
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200">
            {pretty(torneoDisplay)}
          </span>
        </div>
      ) : null}
      {/* Header resultado */}
      <div className="flex items-center justify-between">
        <div className="text-xl sm:text-2xl font-bold text-slate-800">
          {resultado}
        </div>
        {condition !== "neutro" && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
            {condition === "visitante" ? "Visitante" : "Local"}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title={`Goleadores ${pretty(activeClub)}`}>
          <Chips items={propiosArr} />
        </Section>

        <Section title={`Goleadores ${rivalName}`}>
          <Chips items={rivalesArr} />
        </Section>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title={`Expulsados ${pretty(activeClub)}`}>
          <Chips items={expPropiosArr} tone="red" />
        </Section>

        <Section title={`Expulsados ${rivalName}`}>
          <Chips items={expRivalesArr} tone="red" />
        </Section>
      </div>
    </div>
  );
};

export default Resumen;

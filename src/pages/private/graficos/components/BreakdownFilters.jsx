import React from "react";

export default function BreakdownFilters({
  breakdown,
  setBreakdown,
  years,
  selectedYear,
  setSelectedYear,
  tournaments,
  selectedTournament,
  setSelectedTournament,
}) {
  const isYear = breakdown === "year" || breakdown === "euroYear";
  const isTournament =
    breakdown === "tournament" || breakdown === "euroTournament";

  const yearPlaceholder =
    breakdown === "euroYear" ? "Elegí temporada…" : "Elegí año…";

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        value={breakdown}
        onChange={(e) => setBreakdown(e.target.value)}
      >
        <option value="all">Completo</option>
        <option value="year">Por año</option>
        <option value="tournament">Por campeonato</option>
        <option value="euroYear">Calendario europeo (por temporada)</option>
        <option value="euroTournament">
          Calendario europeo (por campeonato)
        </option>
      </select>

      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
        value={selectedYear ?? ""}
        onChange={(e) => setSelectedYear(e.target.value || null)}
        disabled={!isYear}
      >
        <option value="">{yearPlaceholder}</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
        value={selectedTournament ?? ""}
        onChange={(e) => setSelectedTournament(e.target.value || null)}
        disabled={!isTournament}
      >
        <option value="">Elegí campeonato…</option>
        {tournaments.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

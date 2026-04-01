import React, { useMemo, useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { pretty } from "../../match/utils/pretty";

const MIN_DEFAULT = 5;

const isPlayerNode = (v) =>
  v &&
  typeof v === "object" &&
  Object.prototype.hasOwnProperty.call(v, "goals");

const formatName = (prefix, name) => {
  // si viene agrupado por inicial: p + guerrero => "p.guerrero"
  // si no: "alvarez"
  if (!prefix) return String(name);
  return `${String(prefix)}.${String(name)}`;
};

const AllGoleadores = () => {
  const { state: lineupState } = useLineups();
  const [minGoals, setMinGoals] = useState(MIN_DEFAULT);

  const [sortConfig, setSortConfig] = useState({
    key: "goals",
    direction: "desc",
  });

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const goleadores = useMemo(() => {
    const lineups = lineupState?.lineups ?? {};
    const rows = [];

    for (const [clubKey, bucket] of Object.entries(lineups)) {
      const team = bucket?.label ?? clubKey;
      const ps = bucket?.playersStats;

      if (!ps || typeof ps !== "object") continue;

      for (const [k, v] of Object.entries(ps)) {
        if (isPlayerNode(v)) {
          const goals = Number(v?.goals ?? 0);
          const pj = Number(v?.totals?.matchesPlayed ?? 0);
          rows.push({
            name: String(k),
            team,
            goals,
            pj,
            prom: pj > 0 ? goals / pj : 0,
          });
          continue;
        }
        if (v && typeof v === "object") {
          for (const [innerK, innerV] of Object.entries(v)) {
            if (!isPlayerNode(innerV)) continue;
            const goals = Number(innerV?.goals ?? 0);
            const pj = Number(innerV?.totals?.matchesPlayed ?? 0);
            rows.push({
              name: formatName(k, innerK),
              team,
              goals,
              pj,
              prom: pj > 0 ? goals / pj : 0,
            });
          }
        }
      }
    }

    const filtered = rows.filter((r) => r.goals >= Number(minGoals || 0));

    filtered.sort((a, b) => {
      const { key, direction } = sortConfig;

      let valA = a[key];
      let valB = b[key];

      // Manejo especial para strings (nombres)
      if (typeof valA === "string") {
        const cmp = valA.localeCompare(valB, "es", { sensitivity: "base" });
        return direction === "asc" ? cmp : -cmp;
      }

      // Ordenamiento numérico
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [lineupState, minGoals, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="p-3 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            ⚽ Goleadores
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Mín. goles
          </label>
          <input
            type="number"
            min={0}
            value={minGoals}
            onChange={(e) => setMinGoals(e.target.value)}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="sticky top-0 z-10 bg-slate-700 border-b border-slate-200">
          <div className="grid grid-cols-[10%_15%_30%_15%_15%] gap-3 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-white">
            <div className="text-center cursor-default">N°</div>
            <button
              onClick={() => requestSort("goals")}
              className="text-center hover:text-blue-300 transition"
            >
              Goles{getSortIcon("goals")}
            </button>
            <button
              onClick={() => requestSort("name")}
              className="text-left hover:text-blue-300 transition"
            >
              Jugador{getSortIcon("name")}
            </button>
            <button
              onClick={() => requestSort("pj")}
              className="text-center hover:text-blue-300 transition"
            >
              PJ{getSortIcon("pj")}
            </button>
            <button
              onClick={() => requestSort("prom")}
              className="text-center hover:text-blue-300 transition"
            >
              PROM{getSortIcon("prom")}
            </button>
          </div>
        </div>

        {goleadores.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            No hay jugadores con {minGoals}+ goles.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {goleadores.map((r, idx) => (
              <div
                key={`${r.team}-${r.name}-${idx}`}
                className={[
                  "grid grid-cols-[10%_15%_30%_15%_15%] gap-3 px-4 py-3 items-center transition",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50",
                  "hover:bg-blue-50",
                ].join(" ")}
              >
                <div className="flex justify-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-slate-100 text-[12px] font-bold text-slate-500">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex justify-center">
                  <span className="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-slate-900 text-white text-sm font-bold shadow-sm">
                    {r.goals}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">
                    {pretty(r.name)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {pretty(r.team)}
                  </div>
                </div>

                <div className="flex justify-center ">
                  <span className="text-sm font-medium text-slate-600">
                    {r.pj}
                  </span>
                </div>

                <div className="flex justify-center ">
                  <span className="text-sm font-mono font-bold text-blue-600">
                    {r.prom.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllGoleadores;

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

  const goleadores = useMemo(() => {
    const lineups = lineupState?.lineups ?? {};

    const rows = [];

    for (const [clubKey, bucket] of Object.entries(lineups)) {
      const team = bucket?.label ?? clubKey;
      const ps = bucket?.playersStats;

      if (!ps || typeof ps !== "object") continue;

      for (const [k, v] of Object.entries(ps)) {
        // Caso 1: "alvarez": { goals: 3 }
        if (isPlayerNode(v)) {
          const goals = Number(v?.goals ?? 0);
          const pj = Number(v?.totals?.matchesPlayed ?? 0);
          rows.push({
            name: String(k),
            team,
            goals,
            pj,
          });
          continue;
        }

        // Caso 2: "p": { "guerrero": { goals: 44 } }
        if (v && typeof v === "object") {
          for (const [innerK, innerV] of Object.entries(v)) {
            if (!isPlayerNode(innerV)) continue;
            const goals = Number(innerV?.goals ?? 0);
            const pj = Number(innerV?.totals?.matchesPlayed ?? 0);

            rows.push({
              name: formatName(k, innerK), // "p.guerrero"
              team,
              goals,
              pj,
            });
          }
        }
      }
    }

    // ✅ filtro goals
    const filtered = rows.filter((r) => r.goals >= Number(minGoals || 0));

    // ✅ orden: goals desc, nombre asc
    filtered.sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    });

    return filtered;
  }, [lineupState, minGoals]);

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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header fijo y alineado */}
          <div className="sticky top-0 z-10 bg-slate-700 border-b border-slate-200">
            <div className="grid grid-cols-[10%_15%_50%_15%] gap-3 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-white">
              <div className="text-center">N°</div>
              <div className="text-center">Goles</div>
              <div>Jugador</div>
              <div className="text-center">PJ</div>
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
                    "grid grid-cols-[10%_15%_50%_15%] gap-3 px-4 py-3 items-center transition",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-200", // ✅ zebra
                    "hover:bg-slate-100", // ✅ hover más notorio
                  ].join(" ")}
                >
                  {/* N° */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-blue-400 text-sm font-extrabold text-slate-700">
                      {idx + 1}
                    </span>
                  </div>

                  {/* GOLES */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center w-14 h-9 rounded-xl bg-slate-900 text-white text-sm font-extrabold shadow-sm">
                      {r.goals}
                    </span>
                  </div>

                  {/* JUGADOR */}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                      {pretty(r.name)}
                    </div>
                    {/* opcional: subtítulo más chico */}
                    <div className="text-xs text-slate-500 ">{r.team}</div>
                  </div>

                  {/* EQUIPO */}
                  <div className="min-w-0 hidden sm:block ">
                    <div className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 truncate">
                      {r.team}
                    </div>
                  </div>
                  {/* PJ */}
                  <div className="flex justify-center ">
                    <span className="inline-flex items-center justify-center w-14 h-9 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-800">
                      {r.pj}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllGoleadores;

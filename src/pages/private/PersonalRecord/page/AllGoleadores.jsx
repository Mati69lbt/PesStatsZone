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
          rows.push({
            name: String(k),
            team,
            goals,
          });
          continue;
        }

        // Caso 2: "p": { "guerrero": { goals: 44 } }
        if (v && typeof v === "object") {
          for (const [innerK, innerV] of Object.entries(v)) {
            if (!isPlayerNode(innerV)) continue;
            const goals = Number(innerV?.goals ?? 0);

            rows.push({
              name: formatName(k, innerK), // "p.guerrero"
              team,
              goals,
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
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 bg-slate-50 border-b">
          <div className="col-span-2 text-center">Goles</div>
          <div className="col-span-5">Jugador</div>
          <div className="col-span-5">Equipo</div>
        </div>

        {goleadores.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            No hay jugadores con {minGoals}+ goles.
          </div>
        ) : (
          <div className="divide-y">
            {goleadores.map((r, idx) => (
              <div
                key={`${r.team}-${r.name}-${idx}`}
                className="grid grid-cols-12 gap-2 px-3 py-2 items-center"
              >
                <div className="col-span-2 text-center">
                  <span className="inline-flex items-center justify-center min-w-[44px] rounded-full border px-2 py-1 text-sm font-extrabold">
                    {r.goals}
                  </span>
                </div>

                <div className="col-span-5 font-semibold text-slate-900 truncate">
                  {pretty(r.name)}
                </div>

                <div className="col-span-5 text-slate-700 truncate">
                  {r.team}
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

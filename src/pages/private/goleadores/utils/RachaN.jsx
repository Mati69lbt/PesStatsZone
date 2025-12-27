import React, { useMemo } from "react";

const GOAL_FLAGS = ["gol", "doblete", "triplete", "hattrick"];

function norm(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

function scorerMadeGoal(scorerObj) {
  if (!scorerObj || typeof scorerObj !== "object") return false;
  // No queremos contar cosas como expulsión o isOwnGoal; solo flags de gol
  return GOAL_FLAGS.some((k) => scorerObj[k] === true);
}

function getPlayedPlayers(match) {
  const starters = Array.isArray(match?.starters) ? match.starters : [];
  const subs = Array.isArray(match?.substitutes) ? match.substitutes : [];
  return new Set([...starters, ...subs].map(norm).filter(Boolean));
}

function getScorersSet(match, clubLower) {
  const arr = Array.isArray(match?.goleadoresActiveClub)
    ? match.goleadoresActiveClub
    : [];
  const scorers = new Set();

  for (const g of arr) {
    const name = norm(g?.name);
    if (!name) continue;

    // si viene activeClub, lo validamos; si no viene, lo ignoramos
    const activeClub = g?.activeClub ? norm(g.activeClub) : null;
    if (activeClub && clubLower && activeClub !== clubLower) continue;

    if (scorerMadeGoal(g)) scorers.add(name);
  }

  return scorers;
}

function buildRows({ matchesSorted, playersActive, clubLower, mode }) {
  // mode: "all" | "local" | "visitante"
  const matches =
    mode === "all"
      ? matchesSorted
      : matchesSorted.filter((m) => norm(m?.condition) === mode);

  const rows = [];

  for (const p of playersActive) {
    // 1) localizar el último partido (en este modo) donde jugó y metió gol
    let lastGoalIdx = -1;

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const played = getPlayedPlayers(m);
      if (!played.has(p)) continue;

      const scorers = getScorersSet(m, clubLower);
      if (scorers.has(p)) lastGoalIdx = i;
    }

    if (lastGoalIdx === -1) {
      // nunca hizo un gol => NO se muestra
      continue;
    }

    // 2) contar partidos desde el próximo partido posterior a su último gol
    let drought = 0;
    let lastNoGoalMatch = null;

    for (let i = lastGoalIdx + 1; i < matches.length; i++) {
      const m = matches[i];
      const played = getPlayedPlayers(m);
      if (!played.has(p)) continue;

      const scorers = getScorersSet(m, clubLower);
      if (scorers.has(p)) {
        // metió gol después => su "último gol" en realidad es este, y la racha se reinicia
        // pero como ya estamos recorriendo desde lastGoalIdx+1, esto significa que la racha actual es 0
        drought = 0;
        lastNoGoalMatch = null;
        lastGoalIdx = i;
        continue;
      }

      drought += 1;
      lastNoGoalMatch = m;
    }

    // Si no tiene racha actual (0) => NO se muestra (lo que pediste)
    if (drought < 3) continue;
    const lastGoalMatch = matches[lastGoalIdx];
    rows.push({
      player: p,
      drought,
      // Rival del último gol (punto de partida de la racha)
      rival: lastGoalMatch?.rival ?? "",
      // (opcional) para debug: rival del último partido sin gol contado
      rivalUltimoSinGol: lastNoGoalMatch?.rival ?? "",
    });
  }

  // Orden: más sequía arriba
  rows.sort((a, b) => b.drought - a.drought);

  return rows;
}

function Table({ title, rows }) {
  return (
    <div className="mt-2">
      <h2 className="text-xs font-semibold">{title}</h2>

      {rows.length === 0 ? (
        <div className="mt-2 text-sm opacity-70">
          No hay jugadores con racha negativa para mostrar.
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full table-fixed text-[11px]">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-2 py-1 w-[44%]">Jugador</th>
                <th className="px-2 py-1 w-[18%]">Racha</th>
                <th className="px-2 py-1 w-[38%]">Rival</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={`${r.player}-${title}`} className="border-t">
                  <td className="px-2 py-1 capitalize truncate whitespace-nowrap">
                    {r.player}
                  </td>

                  <td className="px-2 py-1 font-semibold whitespace-nowrap">
                    {r.drought}
                  </td>

                  <td className="px-2 py-1 truncate whitespace-nowrap">
                    {r.rival}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const RachaN = ({ data }) => {
  const computed = useMemo(() => {
    const d = data ?? {};

    const clubLower = norm(d?.label) || norm(d?.matches?.[0]?.club) || "";
    const playersActive = (Array.isArray(d?.players) ? d.players : [])
      .map(norm)
      .filter(Boolean);

    const activeSet = new Set(playersActive);

    // Solo partidos del club (ignoramos rival)
    const matchesClub = (Array.isArray(d?.matches) ? d.matches : []).filter(
      (m) => norm(m?.club) === clubLower
    );

    // Orden por createdAt (como pediste)
    const matchesSorted = [...matchesClub].sort(
      (a, b) => (a?.createdAt ?? 0) - (b?.createdAt ?? 0)
    );

    // (extra safety) aseguramos que starters/substitutes/goleadores sean comparables
    const rowsAll = buildRows({
      matchesSorted,
      playersActive: [...activeSet],
      clubLower,
      mode: "all",
    });

    const rowsLocal = buildRows({
      matchesSorted,
      playersActive: [...activeSet],
      clubLower,
      mode: "local",
    });

    const rowsVisitante = buildRows({
      matchesSorted,
      playersActive: [...activeSet],
      clubLower,
      mode: "visitante",
    });

    return { clubLower, rowsAll, rowsLocal, rowsVisitante };
  }, [data]);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold">Racha de Sequía Goleadora</h1>
      <div className="mt-1 text-sm opacity-70">
        Club: <span className="capitalize">{computed.clubLower}</span>
      </div>
      <div className="mt-2 grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        <Table title="General" rows={computed.rowsAll} />
        <Table title="Local" rows={computed.rowsLocal} />
        <Table title="Visitante" rows={computed.rowsVisitante} />
      </div>
    </div>
  );
};

export default RachaN;

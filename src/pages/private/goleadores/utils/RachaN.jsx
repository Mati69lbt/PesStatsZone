import React, { useMemo, useState } from "react";

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
  rows.sort((a, b) => a.drought - b.drought);

  return rows;
}

function Table({ title, rows, isOpen = true, onToggle = null }) {
  const [openKey, setOpenKey] = useState(null);
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      {/* Header integrado */}
     

      <div
        onClick={onToggle || undefined}
        className={`bg-slate-50 px-2 py-1 border-b border-slate-200 flex items-center justify-between
    ${onToggle ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""}`}
      >
        <h2 className="text-[14px] text-center font-semibold w-full">
          {title}
        </h2>
        {onToggle && (
          <span className="text-slate-400 text-xs">{isOpen ? "▲" : "▼"}</span>
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${onToggle && !isOpen ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"}`}
      >
        {rows.length === 0 ? (
          <div className="px-2 py-2 text-[11px] opacity-70">
            No hay jugadores con racha negativa para mostrar.
          </div>
        ) : (
          <table className="w-full table-fixed text-[11px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-1 w-[8%] text-center">#</th>
                <th className="px-2 py-1 w-[40%] text-left">Jugador</th>
                <th className="px-2 py-1 w-[16%] text-center">Racha</th>
                <th className="px-2 py-1 w-[36%] text-left">Rival</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.player}-${title}`} className="border-t">
                  <td className="px-2 py-1 text-center text-slate-500">
                    {i + 1}
                  </td>
                  <td className="px-2 py-1 capitalize truncate whitespace-nowrap">
                    {r.player}
                  </td>

                  <td className=" text-center px-2 py-1 font-semibold whitespace-nowrap bg-amber-100">
                    {r.drought}
                  </td>

                  <td className="px-2 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenKey(
                          openKey === `${r.player}-${title}`
                            ? null
                            : `${r.player}-${title}`,
                        )
                      }
                      className={
                        "block w-full text-left " +
                        (openKey === `${r.player}-${title}`
                          ? "whitespace-normal break-words"
                          : "truncate whitespace-nowrap")
                      }
                      title={r.rival} // desktop hover sigue funcionando
                    >
                      {r.rival}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const RachaN = ({ data }) => {
  const [openTab, setOpenTab] = useState(null);
  const computed = useMemo(() => {
    const d = data ?? {};

    const clubLower = norm(d?.label) || norm(d?.matches?.[0]?.club) || "";
    const playersActive = (Array.isArray(d?.players) ? d.players : [])
      .map(norm)
      .filter(Boolean);

    const activeSet = new Set(playersActive);

    // Solo partidos del club (ignoramos rival)
    const matchesClub = (Array.isArray(d?.matches) ? d.matches : []).filter(
      (m) => norm(m?.club) === clubLower,
    );

    // Orden por createdAt (como pediste)
    const matchesSorted = [...matchesClub].sort(
      (a, b) => (a?.createdAt ?? 0) - (b?.createdAt ?? 0),
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
      <div className="flex flex-col lg:flex-row items-start justify-center gap-3">
        <div className="w-full lg:flex-1 min-w-0">
          <Table
            title="General"
            rows={computed.rowsAll}
            isOpen={openTab === "general"}
            onToggle={() =>
              setOpenTab(openTab === "general" ? null : "general")
            }
          />
        </div>
        <div className="w-full lg:flex-1 min-w-0">
          <Table
            title="Local"
            rows={computed.rowsLocal}
            isOpen={openTab === "local"}
            onToggle={() => setOpenTab(openTab === "local" ? null : "local")}
          />
        </div>
        <div className="w-full lg:flex-1 min-w-0">
          <Table
            title="Visitante"
            rows={computed.rowsVisitante}
            isOpen={openTab === "visitante"}
            onToggle={() =>
              setOpenTab(openTab === "visitante" ? null : "visitante")
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RachaN;

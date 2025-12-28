import React from "react";
import { prettySafe } from "../../campeonatos/util/funtions";

const rankStyles = (index) => {
  if (index === 0) return { bg: "bg-amber-50", icon: "🥇", isTop3: true };
  if (index === 1) return { bg: "bg-slate-50", icon: "🥈", isTop3: true };
  if (index === 2) return { bg: "bg-orange-50/40", icon: "🥉", isTop3: true };
  return { bg: "bg-white", icon: `${index + 1}º`, isTop3: false };
};

const TopGoleadores = ({
  playersStats = {},
  topN = 7,
  mode = "horizontal",
  className = "",
  years = [],
  data = null,
  showHomeAway = false,
}) => {
  
  // igual que en CampDesgl.jsx (misma lógica)
  const calcularGolesGoleador = (g) => {
    if (!g) return 0;
    if (g.triplete || g.hattrick) return 3;
    if (g.doblete) return 2;
    if (g.gol) return 1;
    // fallback por si algún día guardás number directo:
    if (typeof g.goals === "number") return g.goals;
    return 0;
  };

  const getMatchYear = (m) => {
    const y = m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio;
    if (y !== undefined && y !== null) return String(y);

    // fallback: si alguna key trae "...._2019"
    const key =
      m?.torneoKey || m?.tournamentKey || m?.torneo || m?.competitionKey || "";
    const mm = String(key).match(/(\d{4})/);
    return mm ? mm[1] : null;
  };

  const goalsMaps = React.useMemo(() => {
    const ms = data?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return null;

    const allowed = new Set((years || []).map(String));

    const all = {};
    const local = {};
    const visitante = {};

    const normCond = (c) =>
      String(c || "")
        .toLowerCase()
        .trim(); // "local" | "visitante"

    for (const match of ms) {
      const y = getMatchYear(match);
      if (allowed.size > 0) {
        if (!y || !allowed.has(String(y))) continue;
      }

      const cond = normCond(match?.condition);
      const scorers = Array.isArray(match?.goleadoresActiveClub)
        ? match.goleadoresActiveClub
        : [];

      for (const g of scorers) {
        if (g?.isOwnGoal) continue; // por si te llegan autogoles acá

        const name = g?.name;
        const goles = calcularGolesGoleador(g);
        if (!name || goles <= 0) continue;

        all[name] = (all[name] || 0) + goles;

        if (cond === "local") local[name] = (local[name] || 0) + goles;
        if (cond === "visitante")
          visitante[name] = (visitante[name] || 0) + goles;
      }
    }

    return { all, local, visitante };
  }, [data, years]);

  // tu lógica vieja (la dejamos como fallback)
  const goalsForYears = (st) => {
    const allowed = new Set((years || []).map(String));
    const total = st?.goals ?? 0;
    if (allowed.size === 0) return total;

    const bt = st?.byTournament ?? {};
    let sum = 0;

    for (const [key, val] of Object.entries(bt)) {
      const m = key.match(/_(\d{4})$/);
      if (m && allowed.has(m[1])) sum += val?.goals ?? 0;
    }
    return sum;
  };

  // armo la lista con unión de nombres (por si hay un goleador que no esté en playersStats)
  const names = new Set([
    ...Object.keys(playersStats || {}),
    ...(goalsMaps?.all ? Object.keys(goalsMaps.all) : []),
  ]);

  const buildListFromMap = (map, limit) =>
    Object.entries(map || {})
      .map(([name, goals]) => ({ name, goals }))
      .filter((x) => x.goals > 0)
      .sort((a, b) => {
        const diff = b.goals - a.goals;
        if (diff !== 0) return diff;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      })
      .slice(0, limit);

  const lista = goalsMaps ? buildListFromMap(goalsMaps.all, topN) : []; // (si querés, dejá tu fallback viejo acá)

  const halfN = Math.floor(topN / 2);
  const listaLocal = goalsMaps ? buildListFromMap(goalsMaps.local, halfN) : [];
  const listaVisitante = goalsMaps
    ? buildListFromMap(goalsMaps.visitante, halfN)
    : [];

  if (lista.length === 0) return null;

  const yearsLabel = years?.length
    ? [...new Set(years.map(String))].sort().join(" / ")
    : "";

  // vertical
  const VerticalTable = ({ title, list }) => (
    <div className="w-max rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-200 text-[10px] font-semibold tracking-wide text-center uppercase text-slate-800 bg-sky-50">
        {title}
      </div>

      <table className="w-full text-[11px] border-collapse">
        <tbody>
          {!list || list.length === 0 ? (
            <tr>
              <td className="px-3 py-3 text-center text-slate-500" colSpan={3}>
                Sin goles
              </td>
            </tr>
          ) : (
            list.map((j, i) => (
              <tr key={j.name} className="border-b border-slate-100">
                <td className="px-2 py-2 text-center align-middle w-12">
                  <span className="inline-flex items-center justify-center w-9 rounded-full bg-slate-50 ring-1 ring-slate-200 text-base leading-none">
                    {rankStyles(i).icon}
                  </span>
                </td>
                <td className="px-2 py-2 text-left">
                  <div className="text-[12px] font-medium text-slate-800">
                    {prettySafe(j.name)}
                  </div>
                </td>
                <td className="px-2 py-2 text-right tabular-nums font-bold text-slate-900 w-12">
                  {j.goals}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (mode === "vertical") {
    const yearsLabel = years?.length
      ? [...new Set(years.map(String))].sort().join(" / ")
      : "";

    return (
      <div className={`${className} flex items-start justify-center gap-3`}>
        <VerticalTable title={`Goleadores ${yearsLabel}`} list={lista} />

        {showHomeAway && (
          <div className="flex flex-col gap-1 w-max">
            <VerticalTable title={`Local ${yearsLabel}`} list={listaLocal} />
            <VerticalTable
              title={`Visitante ${yearsLabel}`}
              list={listaVisitante}
            />
          </div>
        )}
      </div>
    );
  }

  // fin vertical

  // HORIZONTAL (default)
  return (
    <div className={`mt-4 ${className} md:hidden sm:hidden lg:block`}>
      <div className="w-full">
        {/* Título */}
        <div className="mb-2">
          <div className="w-full text-center text-[15px] font-semibold tracking-wide uppercase text-slate-800">
            Goleadores {yearsLabel}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-lg border border-slate-400 bg-white">
          <table className="w-full min-w-max text-[11px] border-collapse">
            <tbody>
              {/* Fila 1: ranking */}
              <tr className="bg-sky-50 border-b border-slate-400">
                {lista.map((j, i) => {
                  const { icon } = rankStyles(i);
                  const isLast = i === lista.length - 1;

                  return (
                    <td
                      key={`r-${j.name}`}
                      className={
                        "px-3 py-2 text-center whitespace-nowrap font-semibold text-slate-700" +
                        (!isLast ? " border-r border-white/70" : "")
                      }
                    >
                      {icon}
                    </td>
                  );
                })}
              </tr>

              {/* Fila 2: goles */}
              <tr className="border-b border-slate-100">
                {lista.map((j, i) => {
                  const isLast = i === lista.length - 1;

                  return (
                    <td
                      key={`g-${j.name}`}
                      className={
                        "px-2 py-2 text-center whitespace-nowrap tabular-nums font-bold text-slate-900 text-lg" +
                        (!isLast ? " border-r border-slate-100" : "")
                      }
                    >
                      {j.goals}
                    </td>
                  );
                })}
              </tr>

              {/* Fila 3: apellido */}
              <tr>
                {lista.map((j, i) => {
                  const { bg, isTop3 } = rankStyles(i);
                  const isLast = i === lista.length - 1;

                  return (
                    <td
                      key={`n-${j.name}`}
                      className={
                        `px-2 py-2 text-center whitespace-nowrap text-sm ${bg} ` +
                        (isTop3
                          ? "font-semibold text-slate-800"
                          : "text-slate-700") +
                        (!isLast ? " border-r border-slate-100" : "")
                      }
                    >
                      {prettySafe(j.name)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopGoleadores;

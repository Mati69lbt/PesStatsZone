import React, { useState } from "react";
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
  all = null,
}) => {
  const [openAccordion, setOpenAccordion] = useState(false);

  // igual que en CampDesgl.jsx (misma lógica)
  const calcularGolesGoleador = (g) => {
    if (!g) return 0;

    const t = !!(g.triplete || g.hattrick);

    if (t && g.doblete && g.gol) return 6;
    if (t && g.doblete) return 5;
    if (t && g.gol) return 4;
    if (t) return 3;

    if (g.doblete) return 2;
    if (g.gol) return 1;

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
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return null;

    const allowed = new Set((years || []).map(String));
    const allMap = {};
    const pjMap = {}; // <--- NUEVO: Mapa para contar partidos
    const local = {};
    const visitante = {};

    const normCond = (c) =>
      String(c || "")
        .toLowerCase()
        .trim();

    for (const match of ms) {
      const y = getMatchYear(match);
      if (allowed.size > 0 && (!y || !allowed.has(String(y)))) continue;

      const cond = normCond(match?.condition);
      const scorers = Array.isArray(match?.goleadoresActiveClub)
        ? match.goleadoresActiveClub
        : [];

      const jugadoresEnPartido = match?.players || scorers;

      const seenInMatch = new Set();
      for (const p of jugadoresEnPartido) {
        const pName = p?.name;
        if (pName && !seenInMatch.has(pName)) {
          pjMap[pName] = (pjMap[pName] || 0) + 1;
          seenInMatch.add(pName);
        }
      }

      for (const g of scorers) {
        if (g?.isOwnGoal) continue;
        const name = g?.name;
        const goles = calcularGolesGoleador(g);
        if (!name || goles <= 0) continue;

        allMap[name] = (allMap[name] || 0) + goles;
        if (cond === "local") local[name] = (local[name] || 0) + goles;
        if (cond === "visitante")
          visitante[name] = (visitante[name] || 0) + goles;
      }
    }

    return { all: allMap, pj: pjMap, local, visitante };
  }, [all, years]);

  const buildListFromMap = (map, limit) =>
    Object.entries(map || {})
      .map(([name, goals]) => {
        const pj = goalsMaps?.pj?.[name] || 0; // Buscamos los PJ en el mapa nuevo
        return {
          name,
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0, // Calculamos promedio
        };
      })
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
  const VerticalTable = ({ title, list }) => {
    const totalGoles = (list || []).reduce((acc, x) => acc + (x.goals || 0), 0);
    return (
      /* Cambiamos w-max por w-full para que respete el contenedor padre (el 50%) */
      <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Título Principal */}
        <div className="px-3 py-2 border-b border-slate-200 text-[10px] font-semibold tracking-wide text-center uppercase text-slate-800 bg-sky-50">
          {title}
        </div>

        {/* Agregamos table-fixed para que el truncate funcione */}
        <table className="w-full text-[11px] border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[9px] uppercase text-slate-500">
              <th className="w-[12%] px-1 py-1 text-center font-bold">Pos</th>
              <th className="w-[30%] px-2 py-1 text-left font-bold">Jugador</th>
              <th className="w-[12%] px-1 py-1 text-center font-bold text-slate-700">
                G
              </th>
              <th className="w-[12%] px-1 py-1 text-center font-bold">PJ</th>
              <th className="w-[16%] px-1 py-1 text-right pr-2 font-bold">
                Prom
              </th>
            </tr>
          </thead>

          <tbody>
            {!list || list.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-3 text-center text-slate-500"
                  colSpan={5}
                >
                  Sin goles
                </td>
              </tr>
            ) : (
              list.map((j, i) => (
                <tr
                  key={j.name}
                  className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-1 py-2 text-center">
                    {rankStyles(i).icon}
                  </td>
                  {/* TRUNCATE: Ahora funcionará por el table-fixed y el ancho del 48% */}
                  <td className="px-2 py-2 text-left font-medium text-slate-700 truncate overflow-hidden whitespace-nowrap">
                    {prettySafe(j.name)}
                  </td>
                  <td className="px-1 py-2 text-center font-bold text-slate-900 bg-slate-50/50">
                    {j.goals}
                  </td>
                  <td className="px-1 py-2 text-center text-slate-500 tabular-nums">
                    {j.pj}
                  </td>
                  <td className="px-1 py-2 text-right  font-mono text-blue-600 font-semibold">
                    {j.prom.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
            {/* Fila de Totales */}
            {(list || []).length > 0 && (
              <tr className="bg-slate-50 border-t border-slate-200">
                <td
                  className="px-2 py-2 text-right font-semibold text-slate-700"
                  colSpan={2}
                >
                  Total:
                </td>
                <td className="px-1 py-2 text-center tabular-nums font-extrabold text-slate-900 bg-slate-100">
                  {totalGoles}
                </td>
                <td colSpan={2} className="bg-slate-50"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  if (mode === "vertical") {
    const yearsLabel = years?.length
      ? [...new Set(years.map(String))].sort().join(" / ")
      : "";

    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenAccordion((prev) => !prev)}
          className="w-full flex items-center justify-center py-2 focus:outline-none group"
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-center m-2 text-slate-800 tracking-tight">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 px-4 py-2 shadow-sm border border-yellow-200">
              <span>⭐</span>
              <span>{`Goleadores del Año ${yearsLabel}`}</span>
              <span>⭐</span>
            </span>
          </h1>
        </button>
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            openAccordion
              ? "max-h-[2500px] opacity-100 mt-2 mb-2"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`${className} flex items-start justify-center gap-2 w-full px-2`}
          >
            {/* Lado Izquierdo: 50% */}
            <div className="flex-1 min-w-0">
              <VerticalTable title={`Goleadores ${yearsLabel}`} list={lista} />
            </div>

            {/* Lado Derecho: 50% */}
            {showHomeAway && (
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <VerticalTable
                  title={`Local ${yearsLabel}`}
                  list={listaLocal}
                />
                <VerticalTable
                  title={`Visitante ${yearsLabel}`}
                  list={listaVisitante}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // fin vertical

  // HORIZONTAL (default)
return (
  <div className={`${className} mt-4 hidden lg:block`}>
    {/* Título */}
    <div className="mb-2">
      <div className="w-full text-center text-[15px] font-semibold tracking-wide uppercase text-slate-800">
        Goleadores {yearsLabel}
      </div>
    </div>

    {/* Contenedor: Eliminamos el ancho completo y centramos si es necesario */}
    <div className="flex justify-center">
      <div className="inline-block rounded-lg border border-slate-400 bg-white overflow-hidden shadow-sm">
        {/* Tabla: Eliminamos w-full y table-fixed */}
        <table className="text-[11px] border-collapse">
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
                      "px-4 py-2 text-center whitespace-nowrap font-semibold text-slate-700" +
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
                      "px-4 py-2 text-center whitespace-nowrap tabular-nums font-bold text-slate-900 text-lg" +
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
                      `px-4 py-2 text-center whitespace-nowrap text-sm ${bg} ` +
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

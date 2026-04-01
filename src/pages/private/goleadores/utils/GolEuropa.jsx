import React, { useState } from "react";
import { prettySafe } from "../../campeonatos/util/funtions";
import { ChevronDown } from "lucide-react";

const rankStyles = (index) => {
  if (index === 0) return { bg: "bg-emerald-50", icon: "🥇", isTop3: true };
  if (index === 1) return { bg: "bg-slate-50", icon: "🥈", isTop3: true };
  if (index === 2) return { bg: "bg-orange-50/40", icon: "🥉", isTop3: true };
  return { bg: "bg-white", icon: `${index + 1}º`, isTop3: false };
};

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

// Temporada: 01/07 -> 30/06 (para TODO el mundo)
const getMatchSeason = (m) => {
  const raw = m?.fecha || m?.createdAt;
  if (raw) {
    const d =
      typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ? new Date(`${raw}T00:00:00`) // ✅ evita corrimiento UTC
        : new Date(raw);

    if (!Number.isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1..12
      return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }
  }

  // fallback si viniera sin fecha (no debería, pero por las dudas)
  const y = m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio;
  return y !== undefined && y !== null ? String(y) : null;
};

// [CAMBIAR buildListFromMap por esto]

const VerticalTable = ({ title, list }) => {
  const [sortKey, setSortKey] = React.useState("goals");
  const sortedList = React.useMemo(() => {
    return [...(list || [])].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return b[sortKey] - a[sortKey]; // Descendente para números (G, PJ, Prom)
    });
  }, [list, sortKey]);
  const totalGoles = (list || []).reduce((acc, x) => acc + (x.goals || 0), 0);

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-2 py-2 border-b border-slate-200 text-[10px] font-semibold text-center uppercase bg-emerald-50">
        {title}
      </div>

      {/* Agregamos table-fixed y w-full */}
      <table className="w-full text-[11px] border-collapse table-fixed">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-[9px] uppercase text-slate-500 font-bold">
            <th className="w-[12%] px-1 py-1 text-center">Pos</th>

            <th
              className={`w-[30%] px-2 py-1 text-left cursor-pointer hover:text-slate-800 ${sortKey === "name" ? "text-blue-600" : ""}`}
              onClick={() => setSortKey("name")}
            >
              Jugador
            </th>

            <th
              className={`w-[12%] px-1 py-1 text-center cursor-pointer hover:text-slate-800 ${sortKey === "goals" ? "text-blue-600" : ""}`}
              onClick={() => setSortKey("goals")}
            >
              G
            </th>

            <th
              className={`w-[12%] px-1 py-1 text-center cursor-pointer hover:text-slate-800 ${sortKey === "pj" ? "text-blue-600" : ""}`}
              onClick={() => setSortKey("pj")}
            >
              PJ
            </th>

            <th
              className={`w-[16%] px-1 py-1 text-right pr-2 cursor-pointer hover:text-slate-800 ${sortKey === "prom" ? "text-blue-600" : ""}`}
              onClick={() => setSortKey("prom")}
            >
              Prom
            </th>
          </tr>
        </thead>
        <tbody>
          {!sortedList || sortedList.length === 0 ? (
            <tr>
              <td className="px-3 py-3 text-center text-slate-500" colSpan={5}>
                Sin goles
              </td>
            </tr>
          ) : (
            sortedList.map((j, i) => (
              <tr
                key={j.name}
                className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
              >
                <td className="px-1 py-2 text-center align-middle">
                  {rankStyles(i).icon}
                </td>
                {/* TRUNCADO APLICADO AQUÍ */}
                <td className="px-2 py-2 text-left font-medium text-slate-700 truncate overflow-hidden whitespace-nowrap">
                  {prettySafe(j.name)}
                </td>
                <td className="px-1 py-2 text-center font-bold text-slate-900 bg-emerald-50/20">
                  {j.goals}
                </td>
                <td className="px-1 py-2 text-center text-slate-500 tabular-nums">
                  {j.pj}
                </td>
                <td className="px-1 py-2 text-right pr-2 font-mono text-emerald-600 font-semibold">
                  {j.prom.toFixed(2)}
                </td>
              </tr>
            ))
          )}
          {/* Fila de Totales corregida para 5 columnas */}
          {(list || []).length > 0 && (
            <tr className="bg-slate-50 border-t border-slate-200">
              <td
                className="px-2 py-2 text-right font-semibold text-slate-700"
                colSpan={2}
              >
                Total
              </td>
              <td className="px-1 py-2 text-center tabular-nums font-extrabold text-slate-900 bg-emerald-50/50">
                {totalGoles}
              </td>
              <td colSpan={2}></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const GolEuropa = ({
  playersStats = {},
  topN = 15,
  mode = "vertical",
  className = "",
  years = [], // acá son "temporadas" tipo "2023-2024"
  data = null,
  showHomeAway = false,
  all = null,
}) => {
  const [openTemporada, setOpenTemporada] = useState(false);

  const goalsMaps = React.useMemo(() => {
    const ms = all?.matches;
    if (!Array.isArray(ms) || ms.length === 0) return null;

    const allowed = new Set((years || []).map(String));
    const allMap = {};
    const pjMap = {};
    const pjLocalMap = {};
    const pjVisitanteMap = {};
    const localMap = {};
    const visitanteMap = {};

    const normCond = (c) =>
      String(c || "")
        .toLowerCase()
        .trim();

    for (const match of ms) {
      const season = getMatchSeason(match);
      // Filtrar por temporada seleccionada
      if (allowed.size > 0 && (!season || !allowed.has(String(season))))
        continue;

      const cond = normCond(match?.condition); // "local", "visitante" o "neutral"

      // 1. LÓGICA DE PARTIDOS JUGADOS (PJ)
      // Extraemos jugadores de starters y substitutes (según estructura de la imagen)
      const starters = Array.isArray(match?.starters) ? match.starters : [];
      const substitutes = Array.isArray(match?.substitutes)
        ? match.substitutes
        : [];

      // Usamos un Set por partido para evitar duplicados si un jugador aparece dos veces por error
      const participaron = new Set([...starters, ...substitutes]);

      participaron.forEach((pName) => {
        if (!pName) return;

        // PJ General
        pjMap[pName] = (pjMap[pName] || 0) + 1;

        // PJ por Condición (solo local o visitante)
        if (cond === "local") {
          pjLocalMap[pName] = (pjLocalMap[pName] || 0) + 1;
        } else if (cond === "visitante") {
          pjVisitanteMap[pName] = (pjVisitanteMap[pName] || 0) + 1;
        }
      });

      // 2. LÓGICA DE GOLEADORES
      const scorers = Array.isArray(match?.goleadoresActiveClub)
        ? match.goleadoresActiveClub
        : [];

      for (const g of scorers) {
        if (g?.isOwnGoal) continue; // No contar autogoles

        const name = g?.name;
        const goles = calcularGolesGoleador(g);

        if (!name || goles <= 0) continue;

        // Sumar al total general
        allMap[name] = (allMap[name] || 0) + goles;

        // Sumar según condición del partido
        if (cond === "local") {
          localMap[name] = (localMap[name] || 0) + goles;
        } else if (cond === "visitante") {
          visitanteMap[name] = (visitanteMap[name] || 0) + goles;
        }
      }
    }

    return {
      all: allMap,
      pj: pjMap,
      local: localMap,
      visitante: visitanteMap,
      pjLocal: pjLocalMap,
      pjVisitante: pjVisitanteMap,
    };
  }, [all, years]);

  // [REEMPLAZA tu buildListFromMap por este]
  const buildListFromMap = (map, limit, pjMapSource) =>
    Object.entries(map || {})
      .map(([name, goals]) => {
        const pj = pjMapSource?.[name] || 0;
        return {
          name,
          goals,
          pj,
          prom: pj > 0 ? goals / pj : 0,
        };
      })
      .filter((x) => x.goals > 0) // 🔥 Importante: Solo los que metieron goles
      .sort((a, b) => {
        const diff = b.goals - a.goals; // Ordenar por goles DESC
        if (diff !== 0) return diff;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      })
      .slice(0, limit); // 🔥 Aplicar el límite (topN)

  const lista = goalsMaps
    ? buildListFromMap(goalsMaps.all, topN, goalsMaps.pj)
    : [];

  const halfN = Math.floor(topN / 2);

  const listaLocal = goalsMaps
    ? buildListFromMap(goalsMaps.local, halfN, goalsMaps.pjLocal) // <--- Usa pjLocal
    : [];

  const listaVisitante = goalsMaps
    ? buildListFromMap(goalsMaps.visitante, halfN, goalsMaps.pjVisitante) // <--- Usa pjVisitante
    : [];

  if (lista.length === 0) return null;

  const yearsLabel = years?.length
    ? [...new Set(years.map(String))]
        .sort(
          (a, b) => parseInt(a.slice(0, 4), 10) - parseInt(b.slice(0, 4), 10),
        )
        .join(" / ")
    : "";

  // Vertical (lo que estás usando)
  if (mode === "vertical") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenTemporada(!openTemporada)}
          className="w-full flex items-center justify-center py-2 group focus:outline-none"
        >
          <h1 className="md:text-2xl font-extrabold text-center text-slate-800 tracking-tight transition-transform group-hover:scale-[1.02]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
              <span className="text-blue-500">🌍</span>
              <span>{`Goleadores de la Temporada ${yearsLabel}`}</span>
              <ChevronDown
                size={20}
                className={`ml-1 text-slate-400 transition-transform duration-300 ${
                  openTemporada ? "rotate-180" : "rotate-0"
                }`}
              />
            </span>
          </h1>
        </button>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            openTemporada
              ? "max-h-[2500px] opacity-100 mt-2 mb-2"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className={`${className} px-2`}>
            {/* El grid principal que separa General de (Local/Visitante) */}
            <div className="grid grid-cols-2 gap-2 items-start">
              {/* Columna Izquierda: Tabla General */}
              <div className="min-w-0 w-full">
                <VerticalTable
                  title={`Goleadores ${yearsLabel}`}
                  list={lista}
                />
              </div>

              {/* Columna Derecha: Local y Visitante apilados */}
              {showHomeAway && (
                <div className="min-w-0 grid grid-rows-2 gap-2">
                  <VerticalTable
                    title={`Local ${yearsLabel}`}
                    list={listaLocal}
                    className="w-full"
                  />
                  <VerticalTable
                    title={`Visitante ${yearsLabel}`}
                    list={listaVisitante}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si alguna vez lo usás horizontal, lo dejamos simple (misma data)
  return (
    <div className={`mt-2 ${className}`}>
      <div className="w-full text-center text-[15px] font-semibold tracking-wide uppercase text-slate-800">
        Temporada {yearsLabel}
      </div>
      <div className="text-center text-[11px] text-slate-500 mb-2">
        01/07 → 30/06
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <table className="w-full min-w-max text-[11px] border-collapse">
          <tbody>
            <tr className="bg-emerald-50 border-b border-slate-200">
              {lista.map((j, i) => (
                <td
                  key={`r-${j.name}`}
                  className="px-3 py-2 text-center font-semibold text-slate-700"
                >
                  {rankStyles(i).icon}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-100">
              {lista.map((j) => (
                <td
                  key={`g-${j.name}`}
                  className="px-2 py-2 text-center tabular-nums font-bold text-slate-900 text-lg"
                >
                  {j.goals}
                </td>
              ))}
            </tr>
            <tr>
              {lista.map((j, i) => {
                const { bg, isTop3 } = rankStyles(i);
                return (
                  <td
                    key={`n-${j.name}`}
                    className={`px-2 py-2 text-center whitespace-nowrap text-sm ${bg} ${
                      isTop3 ? "font-semibold text-slate-800" : "text-slate-700"
                    }`}
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
  );
};

export default GolEuropa;

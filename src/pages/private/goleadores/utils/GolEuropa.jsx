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

const VerticalTable = ({ title, list }) => {


  const totalGoles = (list || []).reduce((acc, x) => acc + (x.goals || 0), 0);

  return (
    <div
      className={`w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden`}
    >
      <div className="px-2 py-2 border-b border-slate-200 text-[10px] font-semibold text-center uppercase bg-emerald-50">
        {title}
      </div>

      <table className="w-max text-[11px] border-collapse">
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

          {(list || []).length > 0 && (
            <tr className="bg-slate-50 border-t border-slate-200">
              <td
                className="px-2 py-2 text-center font-semibold text-slate-700"
                colSpan={2}
              >
                Total
              </td>
              <td className="px-2 py-2 text-right tabular-nums font-extrabold text-slate-900">
                {totalGoles}
              </td>
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
  console.log("all", all);

  const goalsMaps = React.useMemo(() => {
    const ms = all?.matches; // Aquí 'all' es la PROP
    if (!Array.isArray(ms) || ms.length === 0) return null;

    const allowed = new Set((years || []).map(String));

    // CAMBIO: Usamos nombres distintos para los mapas internos
    const allMap = {};
    const localMap = {};
    const visitanteMap = {};

    const normCond = (c) =>
      String(c || "")
        .toLowerCase()
        .trim();

    for (const match of ms) {
      const season = getMatchSeason(match);
      if (allowed.size > 0) {
        if (!season || !allowed.has(String(season))) continue;
      }

      const cond = normCond(match?.condition);
      const scorers = Array.isArray(match?.goleadoresActiveClub)
        ? match.goleadoresActiveClub
        : [];

      for (const g of scorers) {
        if (g?.isOwnGoal) continue;

        const name = g?.name;
        const goles = calcularGolesGoleador(g);
        if (!name || goles <= 0) continue;

        allMap[name] = (allMap[name] || 0) + goles;

        if (cond === "local") localMap[name] = (localMap[name] || 0) + goles;
        if (cond === "visitante")
          visitanteMap[name] = (visitanteMap[name] || 0) + goles;
      }
    }

    return { all: allMap, local: localMap, visitante: visitanteMap };
    // Asegúrate de que la dependencia sea [all, years]
  }, [all, years]);

  const lista = goalsMaps ? buildListFromMap(goalsMaps.all, topN) : [];
  const halfN = Math.floor(topN / 2);
  const listaLocal = goalsMaps ? buildListFromMap(goalsMaps.local, halfN) : [];
  const listaVisitante = goalsMaps
    ? buildListFromMap(goalsMaps.visitante, halfN)
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

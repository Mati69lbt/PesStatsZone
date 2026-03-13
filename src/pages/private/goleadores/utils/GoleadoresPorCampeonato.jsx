import React, { useMemo, useState } from "react";
import { prettySafe, temporadaKey } from "../../campeonatos/util/funtions";
import { ChevronDown, Trophy, Medal, Target, Zap, Crown } from "lucide-react";

const GoleadoresPorCampeonato = ({ matches, bucket }) => {
  const torneosConfig = bucket?.torneosConfig || {};
  const [openTorneo, setOpenTorneo] = useState(null);

  const getRowTone = (prom) => {
    const p = Number(prom);
    if (p >= 1.5) return "bg-emerald-100/80";
    if (p >= 1.0) return "bg-emerald-50/80";
    if (p >= 0.7) return "bg-lime-50/70";
    if (p >= 0.4) return "bg-slate-50";
    return "bg-white";
  };

  const getPodioStyle = (idx) => {
    if (idx === 0)
      return "bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 ring-1 ring-yellow-300 shadow-md";
    if (idx === 1)
      return "bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 ring-1 ring-slate-300 shadow-sm";
    if (idx === 2)
      return "bg-gradient-to-r from-orange-100 via-amber-50 to-orange-100 ring-1 ring-orange-300 shadow-sm";
    return "";
  };

  const stripYearFromDisplay = (s) =>
    String(s || "")
      .replace(/\s+\b(19|20)\d{2}(?:\s*[-–]\s*(19|20)\d{2})?\b$/, "")
      .trim();

  const splitSeasonFromLabel = (label, fallback) => {
    const rx = /\b(19|20)\d{2}(?:\s*[-–]\s*(19|20)\d{2})?\b$/;
    const mm = String(label || "").match(rx);
    if (mm) return mm[0].replace(/\s+/g, "");
    return fallback ?? null;
  };

  const golesDelEvento = (g) => {
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

  const torneosOrdenados = useMemo(() => {
    if (!Array.isArray(matches)) return [];

    const torneos = {};

    matches.forEach((match) => {
      const {
        torneoDisplay,
        torneoName,
        torneoYear,
        goleadoresActiveClub,
        starters,
        substitutes,
      } = match || {};

      const baseName =
        torneoName || stripYearFromDisplay(torneoDisplay) || "Torneo";

      const labelFull = temporadaKey({
        torneoName: baseName,
        torneoYear,
        fecha: match?.fecha || match?.createdAt,
        torneosConfig,
      });

      const season = splitSeasonFromLabel(
        labelFull,
        torneoYear ? String(torneoYear) : null,
      );

      const key = `${baseName}__${season || "NA"}`;

      if (!torneos[key]) {
        torneos[key] = {
          label: labelFull,
          year: season || torneoYear,
          jugadores: {},
          lastPlayed: 0,
        };
      }

      const ts =
        Date.parse(match?.fecha) ||
        Number(match?.updatedAt) ||
        Number(match?.createdAt) ||
        0;

      if (ts > torneos[key].lastPlayed) {
        torneos[key].lastPlayed = ts;
      }

      // 1) Partidos jugados
      const participantesUnicos = [
        ...new Set(
          [
            ...(Array.isArray(starters) ? starters : []),
            ...(Array.isArray(substitutes) ? substitutes : []),
          ]
            .map((n) => (n ?? "").toString().trim())
            .filter(Boolean),
        ),
      ];

      participantesUnicos.forEach((rawName) => {
        const rawNameClean = rawName.toString().trim();
        const slug = rawNameClean.toLowerCase();

        if (!torneos[key].jugadores[slug]) {
          torneos[key].jugadores[slug] = {
            nombre: prettySafe(rawNameClean),
            pj: 0,
            goles: 0,
            x2: 0,
            x3: 0,
          };
        }

        torneos[key].jugadores[slug].pj += 1;
      });

      // 2) Goles
      const goleadoresArr = Array.isArray(goleadoresActiveClub)
        ? goleadoresActiveClub
        : [];

      goleadoresArr.forEach((g) => {
        if (!g) return;

        const rawName =
          g.pretty ?? g.prettyName ?? g.displayName ?? g.nombre ?? g.name ?? "";

        const rawNameClean = rawName.toString().trim();
        if (!rawNameClean) return;
        const slug = rawNameClean.toLowerCase();

        if (g.isOwnGoal === true || rawNameClean === "__og__") return;

        // IMPORTANTE: no descartar goleadores si no estaban en starters/substitutes
        if (!torneos[key].jugadores[slug]) {
          torneos[key].jugadores[slug] = {
            nombre: prettySafe(rawNameClean),
            pj: 0,
            goles: 0,
            x2: 0,
            x3: 0,
          };
        }

        const stats = torneos[key].jugadores[slug];
        const golesPart = golesDelEvento(g);

        stats.goles += golesPart;

        // misma lógica del original
        if (golesPart === 2) stats.x2 += 1;
        if (golesPart === 3) stats.x3 += 1;
        if (golesPart === 4) stats.x3 += 1;
        if (golesPart === 5) {
          stats.x3 += 1;
          stats.x2 += 1;
        }
        if (golesPart === 6) {
          stats.x3 += 2;
        }
      });
    });

    return Object.values(torneos).sort((a, b) => {
      if (b.lastPlayed !== a.lastPlayed) return b.lastPlayed - a.lastPlayed;

      const ya = parseInt(String(a.year || "").slice(0, 4), 10) || 0;
      const yb = parseInt(String(b.year || "").slice(0, 4), 10) || 0;

      return yb - ya || a.label.localeCompare(b.label);
    });
  }, [matches, torneosConfig]);

  const calcularPromedio = (goles, pj) => {
    if (!pj) return "0.00";
    return (goles / pj).toFixed(2);
  };

  if (!matches || !matches.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No hay partidos cargados para este club.
      </p>
    );
  }

  return (
    <div className="mt-5 max-w-5xl mx-auto px-2">
      <h2 className="text-xl md:text-2xl font-extrabold mb-5 text-center flex items-center justify-center gap-2">
        <Trophy className="text-yellow-500" /> Goleadores por campeonato
      </h2>

      {torneosOrdenados.map((torneo, torneoIdx) => {
        const torneoId = `${torneo.label}-${torneoIdx}`;
        const isOpen = openTorneo === torneoId;
        const jugadores = Object.values(torneo.jugadores)
          .filter((j) => j.goles > 0)
          .sort(
            (a, b) => b.goles - a.goles || a.nombre.localeCompare(b.nombre),
          );

        return (
          <div
            key={torneoId}
            className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden"
          >
            {/* HEADER DEL ACORDEÓN */}
            <button
              onClick={() => setOpenTorneo(isOpen ? null : torneoId)}
              className={`w-full flex items-center justify-between p-4 transition-all ${isOpen ? "bg-slate-800 text-white" : "bg-slate-700 text-white"}`}
            >
              <span className="font-bold uppercase tracking-wide truncate">
                {torneo.label}
              </span>
              <ChevronDown
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* CUERPO DE LA TABLA */}
            <div
              className={`transition-all duration-300 ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
            >
              <div className="p-2 md:p-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead className="text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-2 py-3 text-center">Pos</th>
                      <th className="px-2 py-3 text-left">Jugador</th>
                      <th className="px-2 py-3 text-center">PJ</th>
                      <th className="px-2 py-3 text-center">Goles</th>
                      <th className="px-2 py-3 text-center">Prom.</th>
                      <th className="px-2 py-3 text-center">Especiales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jugadores.map((j, idx) => {
                      const prom = calcularPromedio(j.goles, j.pj);
                      return (
                        <tr
                          key={j.nombre}
                          className={`${getPodioStyle(idx) || getRowTone(prom)} transition-transform hover:scale-[1.01]`}
                        >
                          <td className="py-3 text-center font-bold rounded-l-xl">
                            {idx === 0
                              ? "🥇"
                              : idx === 1
                                ? "🥈"
                                : idx === 2
                                  ? "🥉"
                                  : idx + 1}
                          </td>
                          <td className="py-3 px-2 font-bold text-slate-800">
                            {j.nombre}
                          </td>
                          <td className="text-center">{j.pj}</td>
                          <td className="text-center">
                            <span className="bg-slate-800 text-white px-2 py-1 rounded-lg font-black">
                              {j.goles}
                            </span>
                          </td>
                          <td className="text-center font-mono">{prom}</td>
                          <td className="py-3 text-center rounded-r-xl">
                            <div className="flex justify-center gap-1">
                              {j.x2 > 0 && (
                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold text-[10px]">
                                  x{j.x2}{" "}
                                  <Target size={10} className="inline" />
                                </span>
                              )}
                              {j.x3 > 0 && (
                                <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-bold text-[10px]">
                                  x{j.x3} <Zap size={10} className="inline" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GoleadoresPorCampeonato;

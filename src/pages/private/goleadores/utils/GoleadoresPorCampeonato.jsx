import React, { useMemo } from "react";
import { prettySafe, temporadaKey } from "../../campeonatos/util/funtions";

const GoleadoresPorCampeonato = ({ matches, bucket }) => {
  const torneosConfig = bucket?.torneosConfig || {};

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
    if (g.dobleHattrick) return 6;
    if (g.manito) return 5;
    if (g.poker) return 4;
    if (g.hattrick || g.triplete) return 3;
    if (g.doblete) return 2;
    return g.gol ? 1 : 0;
  };

  const torneosOrdenados = useMemo(() => {
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

      // Base name (sin año pegado)
      const baseName =
        torneoName || stripYearFromDisplay(torneoDisplay) || "Torneo";

      // Label final (respeta europeo/anual según torneosConfig)
      const labelFull = temporadaKey({
        torneoName: baseName,
        torneoYear: torneoYear, // sirve para anual; para europeo se ajusta por fecha
        fecha: match?.fecha || match?.createdAt,
        torneosConfig,
      });

      // season: "2023-2024" o "2023"
      const season = splitSeasonFromLabel(
        labelFull,
        torneoYear ? String(torneoYear) : null,
      );

      // Key estable: base + season
      const key = `${baseName}__${season || "NA"}`;
      const label = labelFull;

      if (!torneos[key]) {
        torneos[key] = {
          label,
          year: season || torneoYear, // puede ser "2023-2024"
          jugadores: {},
          lastPlayed: 0,
        };
      }

      const ts =
        Date.parse(match?.fecha) ||
        Number(match?.updatedAt) ||
        Number(match?.createdAt) ||
        0;

      if (ts > torneos[key].lastPlayed) torneos[key].lastPlayed = ts;

      // ---------- A) PJ por participación (starters + substitutes) ----------
      const startersArr = Array.isArray(starters) ? starters : [];
      const subsArr = Array.isArray(substitutes) ? substitutes : [];

      const participantesUnicos = [
        ...new Set(
          [...startersArr, ...subsArr]
            .map((n) => (n ?? "").toString().trim())
            .filter(Boolean),
        ),
      ];

      participantesUnicos.forEach((rawName) => {
        const slug = rawName.toLowerCase();
        if (!torneos[key].jugadores[slug]) {
          torneos[key].jugadores[slug] = {
            nombre: prettySafe(rawName),
            pj: 0,
            goles: 0,
            x2: 0,
            x3: 0,
          };
        }
        torneos[key].jugadores[slug].pj += 1;
      });

      // ---------- B) Goles / x2 / x3 por eventos (goleadoresActiveClub) ----------
      const goleadoresArr = Array.isArray(goleadoresActiveClub)
        ? goleadoresActiveClub
        : [];

      goleadoresArr.forEach((g) => {
        if (!g) return;

        const rawName =
          g.pretty ?? g.prettyName ?? g.displayName ?? g.nombre ?? g.name ?? "";

        const rawNameClean = rawName.toString().trim();
        if (!rawNameClean) return;

        // ✅ Excluir gol en contra (tu "__og__")
        if (g.isOwnGoal === true || rawNameClean === "__og__") return;

        const slug = rawNameClean.toLowerCase();

        if (!torneos[key].jugadores[slug]) {
          torneos[key].jugadores[slug] = {
            nombre: prettySafe(rawNameClean),
            pj: 0, // ojo: si no jugó (raro), queda 0; pero normalmente ya lo sumó arriba
            goles: 0,
            x2: 0,
            x3: 0,
          };
        }

        const stats = torneos[key].jugadores[slug];
        const golesEnPartido = golesDelEvento(g);

        stats.goles += golesEnPartido;

        if (g.doblete) stats.x2 += 1;
        if (g.hattrick || g.triplete) stats.x3 += 1;
      });
    });

    // Ordenar torneos de más reciente a más viejo
    return Object.values(torneos).sort((a, b) => {
      // ✅ más recientemente jugado primero
      if (b.lastPlayed !== a.lastPlayed) return b.lastPlayed - a.lastPlayed;

      // fallback: año + label
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
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4 text-center">
        🏆 Goleadores por campeonato
      </h2>

      {torneosOrdenados.map((torneo) => {
        const jugadoresOrdenados = Object.values(torneo.jugadores)
          .filter((j) => j.goles > 0)
          .sort(
            (a, b) => b.goles - a.goles || a.nombre.localeCompare(b.nombre),
          );

        const totalGoles = jugadoresOrdenados.reduce(
          (acc, j) => acc + (j.goles || 0),
          0,
        );
        const totalx2 = jugadoresOrdenados.reduce(
          (acc, j) => acc + (j.x2 || 0),
          0,
        );
        const totalx3 = jugadoresOrdenados.reduce(
          (acc, j) => acc + (j.x3 || 0),
          0,
        );
        // ✅ Promedio de promedios (cada jugador pesa igual)
        const sumProms = jugadoresOrdenados.reduce((acc, j) => {
          const pj = Number(j.pj || 0);
          const goles = Number(j.goles || 0);
          return acc + (pj > 0 ? goles / pj : 0);
        }, 0);

        const totalPromProm =
          jugadoresOrdenados.length > 0
            ? (sumProms / jugadoresOrdenados.length).toFixed(2)
            : "0.00";

        return (
          <div
            key={torneo.label}
            className="mb-6 border border-slate-200 rounded-lg bg-white shadow-sm p-3"
          >
            <h3 className="text-base font-semibold mb-3 text-center underline">
              {torneo.label}
            </h3>

            <div className="overflow-x-auto text-xs md:text-sm">
              <table className="table-auto border-collapse border mx-auto w-full md:w-max">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border px-2 py-2 text-center w-10">#</th>
                    <th className="border px-2 py-1 text-left">Jugador</th>
                    <th className="border px-2 py-1 text-center">PJ</th>
                    <th className="border px-2 py-1 text-center">Goles</th>
                    <th className="border px-2 py-1 text-center">Prom.</th>
                    <th className="border px-2 py-1 text-center">⚽x2</th>
                    <th className="border px-2 py-1 text-center">⚽x3</th>
                  </tr>
                </thead>
                <tbody>
                  {jugadoresOrdenados.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border px-2 py-2 text-center text-slate-500"
                      >
                        No hubo goles en este campeonato.
                      </td>
                    </tr>
                  )}

                  {jugadoresOrdenados.map((j, idx) => (
                    <tr
                      key={j.nombre}
                      className="odd:bg-white even:bg-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <td className="border px-2 py-2 text-center font-bold align-middle">
                        {idx + 1}
                      </td>
                      <td className="border px-2 py-1 text-left font-medium">
                        {j.nombre}
                      </td>
                      <td className="border px-2 py-1 text-center">{j.pj}</td>
                      <td className="border px-2 py-1 text-center">
                        {j.goles}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {calcularPromedio(j.goles, j.pj)}
                      </td>
                      <td className="border px-2 py-1 text-center">{j.x2}</td>
                      <td className="border px-2 py-1 text-center">{j.x3}</td>
                    </tr>
                  ))}
                  {jugadoresOrdenados.length > 0 && (
                    <tr className="bg-slate-200 font-bold">
                      <td className="border px-2 py-2 text-right" colSpan={3}>
                        TOTALES
                      </td>

                      <td className="border px-2 py-2 text-center">
                        {totalGoles}
                      </td>

                      <td className="border px-2 py-2 text-center">
                        {totalPromProm}
                      </td>
                      <td className="border px-2 py-2 text-center">
                        {totalx2}
                      </td>
                      <td className="border px-2 py-2 text-center">
                        {totalx3}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GoleadoresPorCampeonato;

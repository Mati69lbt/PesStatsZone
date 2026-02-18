import React, { useMemo } from "react";
import { prettySafe } from "../../campeonatos/util/funtions";

const Villanos = ({ matches }) => {
  const villanos = useMemo(() => {
    const mapa = {};

    matches.forEach((match) => {
      const lista = Array.isArray(match.goleadoresRivales)
        ? match.goleadoresRivales
        : [];

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

      lista.forEach((g) => {
        if (!g) return;

        const rawName = g.name?.toString().trim();
        const rawClub = g.club?.toString().trim() || "";

        if (!rawName) return;

        const nameLower = rawName.toLowerCase();

        // ✅ sacar goles "en contra"
        if (g.isOwnGoal === true) return;
        const hizoAlgoDeGol = !!(g.gol || g.doblete || g.triplete);
        if (!hizoAlgoDeGol) return;
        if (nameLower.includes("__og__")) return;
        if (nameLower.includes("en contra")) return;

        const key = `${rawName.toLowerCase()}|${rawClub.toLowerCase()}`;

        if (!mapa[key]) {
          mapa[key] = {
            nombre: rawName,
            club: rawClub,
            goles: 0,
            x2: 0,
            x3: 0,
            expulsiones: 0,
          };
        }

        const stats = mapa[key];

        const goles = golesDelEvento(g);
        if (goles <= 0) return;

        stats.goles += goles;

        // ⚽x2 / ⚽x3 (eventos)
        if (goles === 2) stats.x2 += 1;

        if (goles === 3) stats.x3 += 1;
        if (goles === 4) stats.x3 += 1; // hat-trick + 1

        if (goles === 5) {
          // hat-trick + doblete
          stats.x3 += 1;
          stats.x2 += 1;
        }

        if (goles === 6) {
          // hat-trick + doblete + 1
          stats.x3 += 2;
        }
    
      });
    });

    return Object.values(mapa)
      .map((v) => {
        const nombrePretty = prettySafe(v.nombre);
        const clubPretty = v.club ? prettySafe(v.club) : "";

        return {
          ...v,
          nombrePretty,
          clubPretty,
        };
      })
      .sort(
        (a, b) =>
          b.goles - a.goles ||
          a.clubPretty.localeCompare(b.clubPretty, "es", {
            sensitivity: "base",
          }) ||
          a.nombrePretty.localeCompare(b.nombrePretty, "es", {
            sensitivity: "base",
          }),
      );
  }, [matches]);

  if (!matches || !matches.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No hay partidos cargados para este club.
      </p>
    );
  }

  if (!villanos.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No se registraron goles rivales.
      </p>
    );
  }

  const totalGoles = villanos.reduce((acc, x) => acc + (x.goles || 0), 0);
  const totalx2 = villanos.reduce((acc, x) => acc + (x.x2 || 0), 0);
  const totalx3 = villanos.reduce((acc, x) => acc + (x.x3 || 0), 0);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4 text-center">
        🧟 Goleadores rivales (Villanos)
      </h2>

      <div className="overflow-x-auto text-xs md:text-sm">
        <table className="table-auto border-collapse border mx-auto ">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-2 text-center w-10">#</th>
              <th className="border px-2 py-1 text-left">Jugador</th>
              <th className="border px-2 py-1 text-left">Club</th>
              <th className="border px-2 py-1 text-center">Goles</th>
              <th className="border px-2 py-1 text-center">⚽x2</th>
              <th className="border px-2 py-1 text-center">⚽x3</th>
            </tr>
          </thead>
          <tbody>
            {villanos.map((v, idx) => (
              <tr
                key={`${v.nombre}-${v.club}`}
                className="odd:bg-white even:bg-slate-100 hover:bg-slate-100 transition-colors"
              >
                <td className="border px-2 py-2 text-center font-bold align-middle">
                  {idx + 1}
                </td>
                <td className="border px-2 py-1 text-left font-medium">
                  {v.nombrePretty}
                </td>
                <td className="border px-2 py-1 text-left">
                  {v.clubPretty || "—"}
                </td>
                <td className="border px-2 py-1 text-center">{v.goles}</td>
                <td className="border px-2 py-1 text-center">{v.x2}</td>
                <td className="border px-2 py-1 text-center">{v.x3}</td>
              </tr>
            ))}
            <tr>
              <td
                className="border px-2 py-1 text-right text-black font-bold "
                colSpan={3}
              >
                TOTALES
              </td>
              <td className="border px-2 py-1 text-center ">{totalGoles}</td>
              <td className="border px-2 py-2 text-center">{totalx2}</td>
              <td className="border px-2 py-2 text-center">{totalx3}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Villanos;

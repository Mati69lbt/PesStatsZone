import React, { useMemo } from "react";
import { prettySafe } from "../../campeonatos/util/funtions";

const Villanos = ({ matches }) => {


  const villanos = useMemo(() => {
    const mapa = {};

    matches.forEach((match) => {
      const lista = Array.isArray(match.goleadoresRivales)
        ? match.goleadoresRivales
        : [];

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

        const hizoDoblete = !!g.doblete;
        const hizoTriplete = !!g.triplete;
        const hizoGol = !!g.gol;
        const fueExpulsado = !!g.expulsion;

        // Contamos goles según el tipo de evento
        if (hizoTriplete) {
          stats.goles += 3;
          stats.x3 += 1;
        } else if (hizoDoblete) {
          stats.goles += 2;
          stats.x2 += 1;
        } else if (hizoGol) {
          stats.goles += 1;
        }

        if (fueExpulsado) {
          stats.expulsiones += 1;
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
          })
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

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4 text-center">
        🧟 Goleadores rivales (Villanos)
      </h2>

      <div className="overflow-x-auto text-xs md:text-sm">
        <table className="table-auto border-collapse border mx-auto min-w-[450px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-1 text-left">Jugador</th>
              <th className="border px-2 py-1 text-left">Club</th>
              <th className="border px-2 py-1 text-center">Goles</th>
              <th className="border px-2 py-1 text-center">⚽x2</th>
              <th className="border px-2 py-1 text-center">⚽x3</th>
              <th className="border px-2 py-1 text-center">Expulsiones</th>
            </tr>
          </thead>
          <tbody>
            {villanos.map((v) => (
              <tr key={`${v.nombre}-${v.club}`}>
                <td className="border px-2 py-1 text-left font-medium">
                  {v.nombrePretty}
                </td>
                <td className="border px-2 py-1 text-left">
                  {v.clubPretty || "—"}
                </td>
                <td className="border px-2 py-1 text-center">{v.goles}</td>
                <td className="border px-2 py-1 text-center">{v.x2}</td>
                <td className="border px-2 py-1 text-center">{v.x3}</td>
                <td className="border px-2 py-1 text-center">
                  {v.expulsiones}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Villanos;

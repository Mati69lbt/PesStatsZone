import React, { useMemo } from "react";
import { prettySafe } from "../../campeonatos/util/funtions";

const Expulsados = ({ matches = [] }) => {
  const expulsados = useMemo(() => {
    const map = new Map();

    (Array.isArray(matches) ? matches : []).forEach((m) => {
      const lista = Array.isArray(m?.goleadoresActiveClub)
        ? m.goleadoresActiveClub
        : [];

      lista.forEach((g) => {
        if (!g) return;

        // Marca de expulsión
        const fueExpulsado = Boolean(g.expulsion);

        if (!fueExpulsado) return;

        const nombre = (g.name || g.nombre || "").trim();
        if (!nombre) return;

        map.set(nombre, (map.get(nombre) || 0) + 1);
      });
    });

    return Array.from(map.entries())
      .map(([nombre, expulsiones]) => ({ nombre, expulsiones }))
      .sort(
        (a, b) =>
          b.expulsiones - a.expulsiones || a.nombre.localeCompare(b.nombre),
      );
  }, [matches]);

  if (!expulsados.length) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        — Sin expulsados —
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-lg md:text-xl font-bold mb-3 text-center">
        🛑 Expulsados
      </h2>

      <div className="overflow-auto border border-slate-200 rounded-lg bg-white shadow-sm  w-full sm:w-4/5 md:w-3/5  mx-auto">
        <table className="w-full border-collapse text-[12px] md:text-sm">
          <thead className="sticky top-0 bg-slate-100 text-slate-700">
            <tr>
              <th className="border border-slate-200 px-2 py-2 text-center w-12">
                #
              </th>
              <th className="border border-slate-200 px-2 py-2 text-left">
                Nombre
              </th>
              <th className="border border-slate-200 px-2 py-2 text-center w-28">
                Expulsiones
              </th>
            </tr>
          </thead>

          <tbody>
            {expulsados.map((p, idx) => (
              <tr key={p.nombre} className="even:bg-slate-50">
                <td className="border border-slate-200 px-2 py-2 text-center tabular-nums">
                  {idx + 1}
                </td>
                <td className="border border-slate-200 px-2 py-2 text-left font-semibold">
                  {prettySafe(p.nombre)}
                </td>
                <td className="border border-slate-200 px-2 py-2 text-center tabular-nums">
                  {p.expulsiones}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expulsados;

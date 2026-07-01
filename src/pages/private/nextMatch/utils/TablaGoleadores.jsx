import React from "react";
import { pretty } from "../../match/utils/pretty";

const FILAS_POR_TABLA = 10; // 👈 CAMBIO: cantidad de filas antes de pasar a la siguiente tabla

const TablaGoleadores = ({ title, rows, hidePJ = false }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  if (safeRows.length === 0) return null;

  // 👇 CAMBIO: partimos las filas en bloques de FILAS_POR_TABLA
  const chunks = [];
  for (let i = 0; i < safeRows.length; i += FILAS_POR_TABLA) {
    chunks.push(safeRows.slice(i, i + FILAS_POR_TABLA));
  }
  if (chunks.length === 0) chunks.push([]); // para mostrar el "—" si no hay filas

  const totalG = safeRows.reduce((acc, r) => acc + (Number(r.g) || 0), 0);
  const totalX2 = safeRows.reduce((acc, r) => acc + (Number(r.x2) || 0), 0);
  const totalX3 = safeRows.reduce((acc, r) => acc + (Number(r.x3) || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white mt-1">
      <div className="m-1 text-center text-sm font-semibold text-slate-700     overflow-hidden text-ellipsis whitespace-nowrap p-1">
        {title}
      </div>

      {/* 👇 CAMBIO: en mobile/tablet, UNA sola tabla completa, sin cortar en bloques */}
      <div className="lg:hidden m-1 overflow-x-auto overflow-hidden rounded-xl border border-slate-200">
        <table className="text-sm w-full">
          <colgroup>
            <col className={hidePJ ? "w-[64%]" : "w-[52%]"} />
            {!hidePJ && <col className="w-[12%]" />}
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">Jugador</th>
              {!hidePJ && <th className="px-2 py-2 text-center">PJ</th>}
              <th className="px-2 py-2 text-center">G</th>
              <th className="px-2 py-2 text-center">x2</th>
              <th className="px-2 py-2 text-center">x3</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {safeRows.length ? (
              safeRows.map((r, i) => {
                const label =
                  r?.name?.trim() === "__OG__"
                    ? "En Contra"
                    : pretty(r?.name ?? "");

                return (
                  <tr key={r.name}>
                    <td className="px-2 py-2 text-slate-800">{i + 1}</td>
                    <td className="px-2 py-2 text-slate-800">
                      <div
                        className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                        title={label}
                      >
                        <span>{label}</span>
                      </div>
                    </td>
                    {!hidePJ && (
                      <td className="px-2 py-2 text-center">{r.pj}</td>
                    )}
                    <td className="px-2 py-2 text-center font-bold">{r.g}</td>
                    <td className="px-2 py-2 text-center">{r.x2}</td>
                    <td className="px-2 py-2 text-center">{r.x3}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={hidePJ ? 4 : 5}
                  className="px-3 py-3 text-slate-500"
                >
                  —
                </td>
              </tr>
            )}
          </tbody>

          {safeRows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-semibold text-slate-700 border-t border-slate-200">
                <td className="px-2 py-2 text-left" colSpan={hidePJ ? 2 : 3}>
                  Total
                </td>
                <td className="px-2 py-2 text-center">{totalG}</td>
                <td className="px-2 py-2 text-center">{totalX2}</td>
                <td className="px-2 py-2 text-center">{totalX3}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 👇 CAMBIO: desde lg en adelante, tablas en bloques de FILAS_POR_TABLA, en fila */}
      <div className="hidden lg:flex lg:flex-row lg:flex-wrap gap-1 m-1">
        {chunks.map((chunkRows, chunkIdx) => (
          <div
            key={chunkIdx}
            className="overflow-hidden rounded-xl border border-slate-200 lg:flex-1 lg:min-w-0"
          >
            <table className="text-sm">
              <colgroup>
                <col className={hidePJ ? "w-max" : "w-max"} />
                {!hidePJ && <col className="w-max" />}
                <col className="w-max" />
                <col className="w-max" />
                <col className="w-max" />
              </colgroup>
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-1 py-2 text-left w-max">#</th>
                  <th className="px-1 py-2 text-left w-max">Jugador</th>
                  {!hidePJ && (
                    <th className="px-1 py-2 text-center w-max">PJ</th>
                  )}
                  <th className="px-1 py-2 text-center w-max">G</th>
                  <th className="px-1 py-2 text-center w-max">x2</th>
                  <th className="px-1 py-2 text-center w-max">x3</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {chunkRows.length ? (
                  chunkRows.map((r, i) => {
                    const label =
                      r?.name?.trim() === "__OG__"
                        ? "En Contra"
                        : pretty(r?.name ?? "");

                    const rowNumber = chunkIdx * FILAS_POR_TABLA + i + 1;

                    return (
                      <tr key={r.name}>
                        <td className="px-1 py-2 text-slate-800">
                          {rowNumber}
                        </td>
                        <td className="px-1 py-2 text-slate-800">
                          <div
                            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                            title={label}
                          >
                            <span>{label}</span>
                          </div>
                        </td>
                        {!hidePJ && (
                          <td className="px-1 py-2 text-center">{r.pj}</td>
                        )}
                        <td className="px-1 py-2 text-center font-bold">
                          {r.g}
                        </td>
                        <td className="px-1 py-2 text-center">{r.x2}</td>
                        <td className="px-1 py-2 text-center">{r.x3}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={hidePJ ? 4 : 5}
                      className="px-3 py-3 text-slate-500"
                    >
                      —
                    </td>
                  </tr>
                )}
              </tbody>

              {chunkIdx === chunks.length - 1 && safeRows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 font-semibold text-slate-700 border-t border-slate-200">
                    <td
                      className="px-1 py-2 text-left"
                      colSpan={hidePJ ? 2 : 3}
                    >
                      Total
                    </td>
                    <td className="px-1 py-2 text-center">{totalG}</td>
                    <td className="px-1 py-2 text-center">{totalX2}</td>
                    <td className="px-1 py-2 text-center">{totalX3}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablaGoleadores;

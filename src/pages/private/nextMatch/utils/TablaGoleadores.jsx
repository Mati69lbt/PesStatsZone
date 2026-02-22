import React from "react";
import { pretty } from "../../match/utils/pretty";

const TablaGoleadores = ({ title, rows, hidePJ = false }) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  console.log(safeRows);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white mt-1">
      <div className="m-1 text-center text-sm font-semibold text-slate-700     overflow-hidden text-ellipsis whitespace-nowrap p-1">
        {title}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 m-1">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className={hidePJ ? "w-[64%]" : "w-[52%]"} />
            {!hidePJ && <col className="w-[12%]" />}
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-2 py-2 text-left">Jugador</th>
              {!hidePJ && <th className="px-2 py-2 text-center">PJ</th>}
              <th className="px-2 py-2 text-center">G</th>
              <th className="px-2 py-2 text-center">x2</th>
              <th className="px-2 py-2 text-center">x3</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {safeRows.length ? (
              safeRows.map((r) => {
                const label =
                  r?.name?.trim() === "__OG__"
                    ? "En Contra"
                    : pretty(r?.name ?? "");
                console.log(label);

                return (
                  <tr key={r.name}>
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
        </table>
      </div>
    </div>
  );
};

export default TablaGoleadores;

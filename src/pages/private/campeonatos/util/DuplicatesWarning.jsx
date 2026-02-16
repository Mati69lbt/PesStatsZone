import React from "react";

const DuplicatesWarning = ({
  duplicadosPorFecha,
  prettySafe,
  getCampTitleFromMatch,
}) => {
  if (!duplicadosPorFecha?.length) return null;

  return (
    <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 shadow-sm">
      <div className="font-semibold text-sm">
        ⚠️ Hay {duplicadosPorFecha.length} fecha
        {duplicadosPorFecha.length !== 1 ? "s" : ""} con 2+ partidos cargados
      </div>

      <div className="mt-2 space-y-2 text-[12px]">
        {duplicadosPorFecha.map(([fechaKey, arr]) => (
          <div
            key={fechaKey}
            className="rounded-lg border border-amber-200 bg-white/60 p-2"
          >
            <div className="font-semibold tabular-nums">Fecha: {fechaKey}</div>

            <ul className="mt-1 list-disc pl-5 space-y-1">
              {arr.map((m) => (
                <li key={m.id || `${m.fecha}-${m.rival}-${m.resultMatch}`}>
                  <span className="font-medium">
                    {prettySafe(m.resultMatch || "Sin resultado")}
                  </span>
                  {" · "}
                  vs {prettySafe(m.rival || "Sin rival")}
                  {" · "}
                  <span className="text-slate-700">
                    {getCampTitleFromMatch(m)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DuplicatesWarning;

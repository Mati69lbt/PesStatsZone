import React, { useMemo, useState } from "react";
import { pretty } from "../../match/utils/pretty";

const formatFechaDMY = (v) => {
  const s = String(v ?? "").trim();
  if (!s) return "—";

  // Caso ISO: YYYY-MM-DD...
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  // Fallback: intento Date.parse
  const t = Date.parse(s);
  if (!Number.isFinite(t)) return s;
  const d = new Date(t);

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

function colorResultado(p) {
  const gf = parseInt(p.golesFavor) || 0;
  const gc = parseInt(p.golesContra) || 0;
  if (gf > gc) return "bg-green-400";
  if (gf === gc) return "bg-yellow-400";
  return "bg-red-400";
}

const Titulo = ({ children }) => (
  <h2 className="font-semibold text-sm whitespace-nowrap">{children}</h2>
);

const Bolitas = ({ lista = [] }) => {
  const [openKey, setOpenKey] = useState(null);

  if (!lista.length) {
    return <span className="text-xs text-gray-400">Sin partidos</span>;
  }

  return (
    <div className="w-full">
      <div className="w-full flex gap-1">
        {lista.map((p, idx) => {
          const key = p.id ?? `${p.fecha}-${p.rival}-${idx}`;
          const isOpen = openKey === key;
          const rival = String(p.rival || "").trim() || "—";
          const condition = p.esLocal === true ? "Local" : "Visitante";
          const gf = p.golesFavor;
          const gc = p.golesContra;

          return (
            <div
              key={key}
              className="flex-1 basis-0 min-w-0 flex flex-col items-center relative"
            >
              {/* Rival: siempre 1 línea truncada */}
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="w-full min-w-0 flex flex-col items-center text-center"
                title={rival}
              >
                {/* Rival: 1 línea truncada */}
                <span className="w-full min-w-0 text-[9px] leading-none text-slate-500 truncate whitespace-nowrap">
                  {rival}
                </span>

                {/* Bolita centrada debajo */}
                <span
                  className={`mt-1 block w-5 h-5 md:w-6 md:h-6 rounded-full ${colorResultado(
                    p,
                  )}`}
                  title={`${p.fecha} vs ${rival}: ${gf}-${gc}`}
                />
              </button>

              {/* Detalle: panel debajo, no invade a los vecinos */}
              {isOpen && (
                <div
                  className="mt-1 w-max rounded-lg border border-slate-200 bg-white
               p-2 py-1 text-[10px] text-slate-700 shadow-sm relative"
                >
                  {/* Cerrar */}

                  <div className="font-semibold leading-tight">
                    {idx + 1} - {rival}
                  </div>

                  <div className="mt-0.5 text-[9px] text-slate-600">
                    {condition}
                  </div>

                  <div className="mt-0.5 tabular-nums">
                    <span className="text-slate-500">GF:</span>{" "}
                    <span className="font-semibold">{gf}</span>{" "}
                    <span className="text-slate-400">·</span>{" "}
                    <span className="text-slate-500">GC:</span>{" "}
                    <span className="font-semibold">{gc}</span>
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <div className="text-[9px] text-slate-500" title={p.fecha}>
                      {formatFechaDMY(p.fecha)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Row = ({ icon, title, list }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2 items-start sm:items-center">
    <Titulo>
      <span className="inline-flex items-center gap-5">
        <span>{icon}</span>
        <span>{title}</span>
      </span>
    </Titulo>
    <Bolitas lista={list} />
  </div>
);

const Ultimos10Resultados = ({ partidos = [], fixedCaptains }) => {
  const {
    partidosOrdenados,
    ultimos10General,
    ultimos10Local,
    ultimos10Visitante,
    capitanes,
    ultimos10PorCapitan,
  } = useMemo(() => {
    const ordenados = [...(partidos || [])].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );

    const top10 = (arr) => arr.slice(0, 10);

    const general = top10(ordenados);

    const local = top10(ordenados.filter((p) => !!p.esLocal));
    // visitante: por compatibilidad con tu modelo actual, todo lo que NO es local
    const visitante = top10(ordenados.filter((p) => !p.esLocal));

    const capsRaw =
      Array.isArray(fixedCaptains) && fixedCaptains.length
        ? fixedCaptains.map((c) => c.toLowerCase())
        : [
            ...new Set(
              ordenados
                .map((p) => (p.equipo || "").toLowerCase())
                .filter(Boolean),
            ),
          ];

    const caps = capsRaw
      .map((cap) => {
        const lastIndex = ordenados.findIndex(
          (p) => (p.equipo || "").toLowerCase() === cap,
        );
        return { cap, lastIndex };
      })
      .filter((x) => x.lastIndex !== -1 && x.lastIndex < 10) // regla #2
      .sort((a, b) => a.lastIndex - b.lastIndex) // regla #1
      .map((x) => x.cap);

    const porCap = Object.fromEntries(
      caps.map((cap) => {
        const base = ordenados.filter(
          (p) => (p.equipo || "").toLowerCase() === cap,
        );
        return [
          cap,
          {
            general: top10(base),
            local: top10(base.filter((p) => !!p.esLocal)),
            visitante: top10(base.filter((p) => !p.esLocal)),
          },
        ];
      }),
    );

    return {
      partidosOrdenados: ordenados,
      ultimos10General: general,
      ultimos10Local: local,
      ultimos10Visitante: visitante,
      capitanes: caps,
      ultimos10PorCapitan: porCap,
    };
  }, [partidos, fixedCaptains]);

  if (!partidosOrdenados.length) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No hay partidos para mostrar.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* General */}
      <div className="rounded-xl border bg-white p-2 shadow-sm">
        <div className="space-y-2">
          <Row
            icon="📈"
            title="Últimos 10 Resultados (General)"
            list={ultimos10General}
          />
          <Row
            icon="🏠"
            title="Últimos 10 Resultados (Local)"
            list={ultimos10Local}
          />
          <Row
            icon="🚌"
            title="Últimos 10 Resultados (Visitante)"
            list={ultimos10Visitante}
          />
        </div>
      </div>

      {/* Por capitán */}
      <div className="space-y-4">
        {capitanes.map((cap) => (
          <div key={cap} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-slate-700">
              🧤 Últimos 10 con {pretty(cap)}
            </div>

            <div className="space-y-2">
              <Row
                icon="📌"
                title="General"
                list={ultimos10PorCapitan[cap]?.general || []}
              />
              <Row
                icon="🏠"
                title="Local"
                list={ultimos10PorCapitan[cap]?.local || []}
              />
              <Row
                icon="🚌"
                title="Visitante"
                list={ultimos10PorCapitan[cap]?.visitante || []}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ultimos10Resultados;

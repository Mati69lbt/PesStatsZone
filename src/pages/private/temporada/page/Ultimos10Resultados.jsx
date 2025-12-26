import React, { useMemo } from "react";
import { pretty } from "../../match/utils/pretty";

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

const Bolitas = ({ lista = [] }) => (
  <div className="flex gap-1 flex-wrap justify-start sm:justify-center">
    {lista.length === 0 ? (
      <span className="text-xs text-gray-400">Sin partidos</span>
    ) : (
      lista.map((p) => (
        <div
          key={p.id}
          className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${colorResultado(p)}`}
          title={`${p.fecha} vs ${String(p.rival || "").trim()}: ${
            p.golesFavor
          }-${p.golesContra}`}
        />
      ))
    )}
  </div>
);

const Row = ({ icon, title, list }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2 items-start sm:items-center">
    <Titulo>
      <span className="inline-flex items-center gap-2">
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
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    const top10 = (arr) => arr.slice(0, 10);

    const general = top10(ordenados);
    const local = top10(ordenados.filter((p) => !!p.esLocal));
    // visitante: por compatibilidad con tu modelo actual, todo lo que NO es local
    const visitante = top10(ordenados.filter((p) => !p.esLocal));

    const caps =
      Array.isArray(fixedCaptains) && fixedCaptains.length
        ? fixedCaptains.map((c) => c.toLowerCase())
        : [
            ...new Set(
              ordenados
                .map((p) => (p.equipo || "").toLowerCase())
                .filter(Boolean)
            ),
          ].sort();

    const porCap = Object.fromEntries(
      caps.map((cap) => {
        const base = ordenados.filter(
          (p) => (p.equipo || "").toLowerCase() === cap
        );
        return [
          cap,
          {
            general: top10(base),
            local: top10(base.filter((p) => !!p.esLocal)),
            visitante: top10(base.filter((p) => !p.esLocal)),
          },
        ];
      })
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
      <div className="rounded-xl border bg-white p-4 shadow-sm">
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

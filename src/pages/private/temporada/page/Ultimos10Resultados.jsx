import React from "react";
import { pretty } from "../../match/utils/pretty";

function colorResultado(p) {
  const gf = parseInt(p.golesFavor) || 0;
  const gc = parseInt(p.golesContra) || 0;
  if (gf > gc) return "bg-green-400";
  if (gf === gc) return "bg-yellow-400";
  return "bg-red-400";
}

const Titulo = ({ children }) => (
  <h2 className="font-semibold text-sm whitespace-nowrap col-start-1">
    {children}
  </h2>
);
const Bolitas = ({ lista }) => (
  <div className="flex gap-1 flex-wrap col-start-2 -ml-20">
    {lista.map((p) => (
      <div
        key={p.id}
        className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${colorResultado(p)}`}
        title={`${p.fecha} vs ${String(p.rival || "").trim()}: ${
          p.golesFavor
        }-${p.golesContra}`}
      />
    ))}
  </div>
);

const Ultimos10Resultados = ({ partidos = [], fixedCaptains }) => {
  if (!partidos.length) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No hay partidos para mostrar.
      </p>
    );
  }
  const partidosOrdenados = [...partidos].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  const ultimos10General = partidosOrdenados.slice(0, 10);

  // Lista de capitanes a renderizar
  const capitanes =
    Array.isArray(fixedCaptains) && fixedCaptains.length
      ? fixedCaptains.map((c) => c.toLowerCase())
      : [
          ...new Set(
            partidosOrdenados
              .map((p) => (p.equipo || "").toLowerCase())
              .filter(Boolean)
          ),
        ].sort();

  const ultimos10PorCapitan = Object.fromEntries(
    capitanes.map((cap) => [
      cap,
      partidosOrdenados
        .filter((p) => (p.equipo || "").toLowerCase() === cap)
        .slice(0, 10),
    ])
  );
  return (
    <>
      {/* General */}
      <div className="grid grid-cols-2 items-center gap-2 mb-2 ml-12">
        <Titulo>📈 Últimos 10 Resultados (General)</Titulo>
        <Bolitas lista={ultimos10General} />
      </div>

      {/* Por capitán (dinámico o fijo) */}
      {capitanes.map((cap) => (
        <div
          key={cap}
          className="grid grid-cols-2 items-center gap-2 mb-2 mt-4 ml-12"
        >
          <Titulo>🧤 Últimos 10 con {pretty(cap)}</Titulo>
          <Bolitas lista={ultimos10PorCapitan[cap]} />
        </div>
      ))}

      <br />
    </>
  );
};

export default Ultimos10Resultados;

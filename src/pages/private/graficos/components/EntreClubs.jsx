import React, { useMemo, useState } from "react";
import { pretty } from "../../match/utils/pretty";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { buildClubsData, buildYearLineData } from "../utils/BuildentreClubes";

// ── paleta de colores por club ────────────────────────────────────────────────
const PALETTE = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];
const clubColor = (idx) => PALETTE[idx % PALETTE.length];

// ── helpers visuales ──────────────────────────────────────────────────────────
const Badge = ({ val, color }) => (
  <span
    className="inline-flex items-center justify-center rounded-full w-6 h-6 text-[10px] font-black text-white ring-2"
    style={{ background: color, ringColor: color }}
  >
    {val}
  </span>
);

const FormaBadge = ({ outcome }) => {
  const cfg = {
    g: "bg-emerald-500",
    e: "bg-amber-400",
    p: "bg-rose-500",
  };
  return (
    <span
      className={`${cfg[outcome]} inline-flex w-5 h-5 rounded-full items-center justify-center text-[9px] font-black text-white`}
    >
      {outcome.toUpperCase()}
    </span>
  );
};

// ── tooltip custom ────────────────────────────────────────────────────────────
const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs space-y-0.5">
      <p className="font-bold text-slate-600 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}:{" "}
          <b>
            {p.value}
            {p.unit || ""}
          </b>
        </p>
      ))}
    </div>
  );
};

// ── 1. Tabla de posiciones ────────────────────────────────────────────────────
const TablaClubs = ({ clubs }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border-collapse">
      <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wide">
        <tr>
          {["Club", "PJ", "G", "E", "P", "GF", "GC", "DIF", "%"].map((h) => (
            <th
              key={h}
              className="border border-slate-200 px-2 py-2 text-center font-bold"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {clubs.map((c, i) => {
          const color = clubColor(i);
          const difColor =
            c.dif > 0
              ? "text-emerald-600"
              : c.dif < 0
                ? "text-rose-500"
                : "text-slate-400";
          return (
            <tr
              key={c.clubKey}
              className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
            >
              <td className="border border-slate-200 px-2 py-2 font-bold text-slate-800">
                <div className="flex items-start gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full mt-1 shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    {(() => {
                      const palabras = pretty(c.label).trim().split(/\s+/);
                      const primera = palabras[0];
                      const resto = palabras.slice(1).join(" ");
                      return (
                        <>
                          <span className="block">{primera}</span>
                          {resto && (
                            <span
                              className="block truncate text-slate-600"
                              title={resto}
                            >
                              {resto}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </span>
                </div>
              </td>
              {[c.pj, c.g, c.e, c.p, c.gf, c.gc].map((v, j) => (
                <td
                  key={j}
                  className="border border-slate-200 px-2 py-2 text-center tabular-nums"
                >
                  {v}
                </td>
              ))}
              <td
                className={`border border-slate-200 px-2 py-2 text-center font-bold tabular-nums ${difColor}`}
              >
                {c.dif > 0 ? `+${c.dif}` : c.dif}
              </td>
              <td
                className="border border-slate-200 px-2 py-2 text-center font-black"
                style={{ color }}
              >
                {c.efec}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ── 2. Barras apiladas G/E/P ──────────────────────────────────────────────────
const BarrasApiladas = ({ clubs }) => {
  const data = clubs.map((c) => ({
    name: pretty(c.label),
    G: c.g,
    E: c.e,
    P: c.p,
  }));
  return (
    <div style={{ width: "100%", height: Math.max(220, clubs.length * 48) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 24, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip content={<TooltipCustom />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="G" name="Ganados" stackId="a" fill="#22c55e" />
          <Bar dataKey="E" name="Empates" stackId="a" fill="#f59e0b" />
          <Bar
            dataKey="P"
            name="Perdidos"
            stackId="a"
            fill="#ef4444"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── 3. Línea de rendimiento por año ──────────────────────────────────────────
const LineaAnual = ({ clubs, lineData }) => {
  if (lineData.length < 2)
    return (
      <p className="text-xs text-slate-400 italic text-center py-4">
        Necesitás datos de al menos 2 años.
      </p>
    );
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={lineData}
          margin={{ left: 0, right: 24, top: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, ""]}
            content={<TooltipCustom />}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
          {clubs.map((c, i) => (
            <Line
              key={c.clubKey}
              type="monotone"
              dataKey={c.label}
              stroke={clubColor(i)}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── 4. Mejor temporada por club ───────────────────────────────────────────────
const MejorTemporada = ({ clubs }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {clubs.map((c, i) => {
      const b = c.bestYear;
      if (!b) return null;
      const color = clubColor(i);
      return (
        <div
          key={c.clubKey}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: color }}
            />
            <span className="text-xs font-bold text-slate-700 truncate">
              {pretty(c.label)}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black" style={{ color }}>
              {b.year}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              mejor temporada
            </span>
          </div>
          <div className="mt-1 flex gap-3 text-xs tabular-nums text-slate-600 font-semibold">
            <span>{b.pj}PJ</span>
            <span className="text-emerald-600">{b.g}G</span>
            <span className="text-amber-500">{b.e}E</span>
            <span className="text-rose-500">{b.p}P</span>
            <span className="font-black ml-auto" style={{ color }}>
              {b.efec}%
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

// ── 5. Promedio GF/GC por partido ─────────────────────────────────────────────
const PromedioGoles = ({ clubs }) => {
  const data = clubs.map((c) => ({
    name: pretty(c.label),
    "GF/PJ": c.avgGf,
    "GC/PJ": c.avgGc,
  }));
  return (
    <div style={{ width: "100%", height: Math.max(220, clubs.length * 48) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 24, top: 4, bottom: 4 }}
          barGap={3}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip content={<TooltipCustom />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="GF/PJ"
            name="GF por partido"
            fill="#22c55e"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="GC/PJ"
            name="GC por partido"
            fill="#ef4444"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── 6. Rachas ganadas ─────────────────────────────────────────────────────────
const RachasGanadas = ({ clubs }) => {
  const maxVal = Math.max(...clubs.map((c) => c.longestWinStreak), 1);
  return (
    <div className="space-y-2">
      {[...clubs]
        .sort((a, b) => b.longestWinStreak - a.longestWinStreak)
        .map((c, i) => {
          const color = clubColor(clubs.indexOf(c));
          const widthPct = Math.round((c.longestWinStreak / maxVal) * 100);
          return (
            <div key={c.clubKey} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 w-28 shrink-0 truncate">
                {pretty(c.label)}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-5 relative">
                <div
                  className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                  style={{
                    width: `${Math.max(widthPct, 8)}%`,
                    background: color,
                  }}
                >
                  <span className="text-[10px] font-black text-white">
                    {c.longestWinStreak}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-semibold w-12 text-right shrink-0">
                {c.longestWinStreak} seg.
              </span>
            </div>
          );
        })}
    </div>
  );
};

// ── 7. Forma reciente comparada ───────────────────────────────────────────────
const FormaComparada = ({ clubs }) => (
  <div className="space-y-3">
    {clubs.map((c, i) => {
      const color = clubColor(i);
      return (
        <div key={c.clubKey} className="flex items-center gap-3">
          <span
            className="text-xs font-bold w-28 shrink-0 truncate"
            style={{ color }}
          >
            {pretty(c.label)}
          </span>
          <div className="flex gap-1 flex-wrap">
            {c.recentForm.length ? (
              [...c.recentForm]
                .reverse()
                .map((o, j) => <FormaBadge key={j} outcome={o} />)
            ) : (
              <span className="text-xs text-slate-300 italic">sin datos</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 ml-auto shrink-0">
            {c.recentForm.filter((o) => o === "g").length}G{" "}
            {c.recentForm.filter((o) => o === "e").length}E{" "}
            {c.recentForm.filter((o) => o === "p").length}P
          </span>
        </div>
      );
    })}
    <p className="text-[10px] text-slate-300 text-right">
      ← más viejo · más reciente →
    </p>
  </div>
);

// ── 8. Capitanes cruzados ─────────────────────────────────────────────────────
const CapitanesCruzados = ({ clubs }) => {
  // Todos los capitanes únicos
  const allCaps = new Map();
  clubs.forEach((c, ci) => {
    c.captains.forEach((cap) => {
      if (!allCaps.has(cap.cap))
        allCaps.set(cap.cap, { cap: cap.cap, clubs: [] });
      allCaps
        .get(cap.cap)
        .clubs.push({ ...cap, clubLabel: c.label, clubIdx: ci });
    });
  });

  const capsList = Array.from(allCaps.values())
    .map((c) => {
      const totalPj = c.clubs.reduce((s, x) => s + x.pj, 0);
      const totalG = c.clubs.reduce((s, x) => s + x.g, 0);
      const totalE = c.clubs.reduce((s, x) => s + x.e, 0);
      const totalP = c.clubs.reduce((s, x) => s + x.p, 0);
      const efec =
        totalPj > 0
          ? Math.round(((totalG * 3 + totalE) / (totalPj * 3)) * 100)
          : 0;
      return { ...c, totalPj, totalG, totalE, totalP, efec };
    })
    .sort((a, b) => b.totalPj - a.totalPj);

  return (
    <div className="overflow-x-auto">
      <table className="w-max text-xs border-collapse">
        <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wide">
          <tr>
            {["Capitán", "Total PJ", "G", "E", "P", "Efec%", "Clubs"].map(
              (h) => (
                <th
                  key={h}
                  className="border border-slate-200 px-2 py-2 text-center font-bold"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {capsList.map((c, i) => (
            <tr
              key={c.cap}
              className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
            >
              <td className="border border-slate-200 px-2 py-2 font-bold text-slate-800 whitespace-nowrap">
                {pretty(c.cap)}
              </td>
              <td className="border border-slate-200 px-2 py-2 text-center font-bold">
                {c.totalPj}
              </td>
              <td className="border border-slate-200 px-2 py-2 text-center text-emerald-600 font-bold">
                {c.totalG}
              </td>
              <td className="border border-slate-200 px-2 py-2 text-center text-amber-500 font-bold">
                {c.totalE}
              </td>
              <td className="border border-slate-200 px-2 py-2 text-center text-rose-500 font-bold">
                {c.totalP}
              </td>
              <td className="border border-slate-200 px-2 py-2 text-center font-black text-slate-700">
                {c.efec}%
              </td>
              <td className="border border-slate-200 px-2 py-2">
                <div className="flex flex-col gap-1">
                  {c.clubs.map((x) => (
                    <span
                      key={x.clubLabel}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white whitespace-nowrap w-fit"
                      style={{ background: clubColor(x.clubIdx) }}
                    >
                      {pretty(x.clubLabel)}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── componente principal ──────────────────────────────────────────────────────
const SECTIONS = [
  { key: "tabla", label: "🏆 Tabla de posiciones" },
  { key: "apiladas", label: "📊 G / E / P por club" },
  { key: "linea", label: "📈 Rendimiento anual" },
  { key: "mejor", label: "⭐ Mejor temporada" },
  { key: "goles", label: "⚽ Promedio de goles" },
  { key: "rachas", label: "🔥 Racha ganada más larga" },
  { key: "forma", label: "🎯 Forma reciente comparada" },
  { key: "capitanes", label: "🧤 Capitanes cruzados" },
];

const EntreClubs = ({ lineupsObj = {} }) => {
  const [openSection, setOpenSection] = useState("");
  const toggle = (key) => setOpenSection((prev) => (prev === key ? null : key));

  const clubs = useMemo(() => buildClubsData(lineupsObj), [lineupsObj]);
  const lineData = useMemo(() => buildYearLineData(clubs), [clubs]);

  if (clubs.length < 2) {
    return (
      <p className="text-center text-sm text-slate-400 italic py-8">
        Necesitás al menos 2 clubs con partidos para ver comparaciones.
      </p>
    );
  }

  const renderContent = (key) => {
    switch (key) {
      case "tabla":
        return <TablaClubs clubs={clubs} />;
      case "apiladas":
        return <BarrasApiladas clubs={clubs} />;
      case "linea":
        return <LineaAnual clubs={clubs} lineData={lineData} />;
      case "mejor":
        return <MejorTemporada clubs={clubs} />;
      case "goles":
        return <PromedioGoles clubs={clubs} />;
      case "rachas":
        return <RachasGanadas clubs={clubs} />;
      case "forma":
        return <FormaComparada clubs={clubs} />;
      case "capitanes":
        return <CapitanesCruzados clubs={clubs} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 w-full lg:w-max mx-auto">
      {SECTIONS.map(({ key, label }) => (
        <section
          key={key}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => toggle(key)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 focus:outline-none"
          >
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
              {label}
            </h2>
            <span
              className={`text-slate-400 text-xs transition-transform duration-200 ${openSection === key ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>
          {openSection === key && (
            <div className="p-3">{renderContent(key)}</div>
          )}
        </section>
      ))}
    </div>
  );
};

export default EntreClubs;

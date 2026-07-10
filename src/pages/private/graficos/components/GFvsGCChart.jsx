import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ── helper: nombre corto del torneo ──────────────────────────────────────────
const stripYear = (name = "") =>
  name
    .toString()
    .replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, "")
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

// ── builder ───────────────────────────────────────────────────────────────────
export const buildGFvsGC = (matches) => {
  const map = new Map();

  for (const m of matches) {
    const raw = m?.torneoDisplay || m?.torneoName || "Sin torneo";
    const year = m?.torneoYear || "";
    const key = `${raw}__${year}`;
    const label = year ? `${stripYear(raw)} ${year}` : stripYear(raw);

    if (!map.has(key)) map.set(key, { label, gf: 0, gc: 0, pj: 0 });

    const row = map.get(key);
    row.gf += Number(m?.golFavor || 0);
    row.gc += Number(m?.golContra || 0);
    row.pj += 1;
  }

  return Array.from(map.values()).sort((a, b) => b.pj - a.pj);
};

// ── tooltip custom ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const gf = payload.find((p) => p.dataKey === "gf")?.value ?? 0;
  const gc = payload.find((p) => p.dataKey === "gc")?.value ?? 0;
  const pj = payload[0]?.payload?.pj ?? 0;
  const dif = gf - gc;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 mb-1 max-w-[160px] leading-tight">
        {label}
      </p>
      <p className="text-slate-500">
        PJ: <span className="font-bold text-slate-800">{pj}</span>
      </p>
      <p className="text-emerald-600">
        GF: <span className="font-bold">{gf}</span>
      </p>
      <p className="text-rose-500">
        GC: <span className="font-bold">{gc}</span>
      </p>
      <p
        className={`font-bold mt-1 ${dif > 0 ? "text-emerald-600" : dif < 0 ? "text-rose-500" : "text-slate-400"}`}
      >
        DIF: {dif > 0 ? `+${dif}` : dif}
      </p>
    </div>
  );
};

// ── label custom dentro de la barra ──────────────────────────────────────────
const BarLabel = ({ x, y, width, height, value }) => {
  if (!value || height < 14) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + 4}
      textAnchor="middle"
      fontSize={10}
      fontWeight="700"
      fill="#fff"
    >
      {value}
    </text>
  );
};

// ── componente principal ──────────────────────────────────────────────────────
const GFvsGCChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <p className="text-center text-sm text-slate-400 italic py-4">
        Sin datos
      </p>
    );
  }

  // 👈 CAMBIO: sin truncate — usamos label completo
  const maxLabelLen = Math.max(...data.map((d) => d.label.length), 10);
  const yAxisWidth = Math.min(Math.max(maxLabelLen * 7, 100), 200); // entre 100 y 200px según el nombre más largo

  const altura = Math.max(240, data.length * 52);

  return (
    <div style={{ width: "100%", height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          barCategoryGap="28%"
          barGap={3}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="label"
            width={yAxisWidth}
            tick={{ fontSize: 11, fontWeight: 600 }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar dataKey="gf" name="GF" fill="#22c55e" radius={[0, 4, 4, 0]}>
            <BarLabel />
          </Bar>
          <Bar dataKey="gc" name="GC" fill="#ef4444" radius={[0, 4, 4, 0]}>
            <BarLabel />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GFvsGCChart;

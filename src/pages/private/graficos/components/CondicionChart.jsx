import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// ── builder ───────────────────────────────────────────────────────────────────
export const buildCondicionData = (matches) => {
  const base = () => ({ pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 });
  const map = { local: base(), visitante: base(), neutro: base() };

  for (const m of matches) {
    const cond = String(m?.condition || "")
      .toLowerCase()
      .trim();
    const key =
      cond === "local"
        ? "local"
        : cond === "visitante"
          ? "visitante"
          : cond === "neutro" || cond === "neutral"
            ? "neutro"
            : null;

    if (!key) continue;

    const f = String(m?.final || "")
      .toLowerCase()
      .trim();
    const gf = Number(m?.golFavor || 0);
    const gc = Number(m?.golContra || 0);
    const outcome =
      f === "ganado"
        ? "g"
        : f === "perdido"
          ? "p"
          : f === "empatado"
            ? "e"
            : gf > gc
              ? "g"
              : gf < gc
                ? "p"
                : "e";

    map[key].pj += 1;
    map[key][outcome] += 1;
    map[key].gf += gf;
    map[key].gc += gc;
  }

  return map;
};

const pct = (val, total) => (total === 0 ? 0 : Math.round((val / total) * 100));

// ── tooltip custom ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs space-y-0.5">
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
};

// ── tabla resumen por condición ───────────────────────────────────────────────
const ResumenRow = ({ label, stats, color }) => {
  const { pj, g, e, p, gf, gc } = stats;
  if (pj === 0) return null;
  const dif = gf - gc;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="font-bold text-slate-600 w-20 shrink-0">{label}</span>
      <div className="flex gap-3 tabular-nums text-slate-700 font-semibold">
        <span>
          PJ <b>{pj}</b>
        </span>
        <span className="text-emerald-600">
          G <b>{g}</b>
        </span>
        <span className="text-amber-500">
          E <b>{e}</b>
        </span>
        <span className="text-rose-500">
          P <b>{p}</b>
        </span>
        <span>
          GF <b>{gf}</b>
        </span>
        <span>
          GC <b>{gc}</b>
        </span>
        <span
          className={
            dif > 0
              ? "text-emerald-600"
              : dif < 0
                ? "text-rose-500"
                : "text-slate-400"
          }
        >
          DIF <b>{dif > 0 ? `+${dif}` : dif}</b>
        </span>
        <span className="text-slate-400">
          %G <b>{pct(g, pj)}</b>
        </span>
      </div>
    </div>
  );
};

// ── colores ───────────────────────────────────────────────────────────────────
const COLORS = {
  local: "#3b82f6",
  visitante: "#f59e0b",
  neutro: "#8b5cf6",
};

const LABELS = {
  local: "Local",
  visitante: "Visitante",
  neutro: "Neutral",
};

// ── componente principal ──────────────────────────────────────────────────────
const CondicionChart = ({ data }) => {
  const condiciones = ["local", "visitante", "neutro"];
  const hayDatos = condiciones.some((c) => data[c]?.pj > 0);

  if (!hayDatos) {
    return (
      <p className="text-center text-sm text-slate-400 italic py-4">
        Sin datos
      </p>
    );
  }

  // Radar: % victorias, % empates, % derrotas, promedio GF, promedio GC
  const radarData = [
    {
      stat: "% Victorias",
      ...Object.fromEntries(
        condiciones.map((c) => [c, pct(data[c].g, data[c].pj)]),
      ),
    },
    {
      stat: "% Empates",
      ...Object.fromEntries(
        condiciones.map((c) => [c, pct(data[c].e, data[c].pj)]),
      ),
    },
    {
      stat: "% Derrotas",
      ...Object.fromEntries(
        condiciones.map((c) => [c, pct(data[c].p, data[c].pj)]),
      ),
    },
    {
      stat: "GF / PJ",
      ...Object.fromEntries(
        condiciones.map((c) => [
          c,
          data[c].pj > 0 ? Math.round((data[c].gf / data[c].pj) * 10) / 10 : 0,
        ]),
      ),
    },
    {
      stat: "GC / PJ",
      ...Object.fromEntries(
        condiciones.map((c) => [
          c,
          data[c].pj > 0 ? Math.round((data[c].gc / data[c].pj) * 10) / 10 : 0,
        ]),
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* radar */}
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={radarData}
            margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            {condiciones
              .filter((c) => data[c].pj > 0)
              .map((c) => (
                <Radar
                  key={c}
                  name={LABELS[c]}
                  dataKey={c}
                  stroke={COLORS[c]}
                  fill={COLORS[c]}
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* tabla resumen */}
      <div className="space-y-2 px-1 overflow-x-auto">
        {condiciones.map((c) => (
          <ResumenRow
            key={c}
            label={LABELS[c]}
            stats={data[c]}
            color={COLORS[c]}
          />
        ))}
      </div>
    </div>
  );
};

export default CondicionChart;

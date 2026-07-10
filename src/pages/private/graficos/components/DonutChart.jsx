import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // 👈 CAMBIO: imports faltantes

ChartJS.register(ArcElement, Tooltip, Legend); // 👈 CAMBIO: registro faltante

// ── helpers exportados para que Extras.jsx los pueda importar ────────────────

export const getOutcome = (m) => {
  const f = String(m?.final || "")
    .toLowerCase()
    .trim();
  if (f === "ganado") return "g";
  if (f === "perdido") return "p";
  if (f === "empatado") return "e";
  const gf = Number(m?.golFavor || 0);
  const gc = Number(m?.golContra || 0);
  return gf > gc ? "g" : gf < gc ? "p" : "e";
};

export const calcStats = (matches) =>
  matches.reduce(
    (acc, m) => {
      acc[getOutcome(m)]++;
      acc.pj++;
      return acc;
    },
    { pj: 0, g: 0, e: 0, p: 0 },
  );

const pct = (val, total) => (total === 0 ? 0 : Math.round((val / total) * 100));

// ── componente ────────────────────────────────────────────────────────────────

const DonutChart = ({ title, stats, size = "sm" }) => {
  // 👈 CAMBIO: prop size
  const { pj, g, e, p } = stats;

  const donutSize = size === "lg" ? "h-40 w-40" : "h-20 w-20"; // 👈 CAMBIO
  const numSize = size === "lg" ? "text-3xl" : "text-xl"; // 👈 CAMBIO

  const data = {
    labels: ["Ganados", "Empatados", "Perdidos"],
    datasets: [
      {
        data: [g, e, p],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderColor: ["#16a34a", "#d97706", "#dc2626"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} (${pct(ctx.raw, pj)}%)`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm w-full">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <div className={`relative ${donutSize}`}>
        <Doughnut data={data} options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${numSize} font-black text-slate-800 leading-none`}>
            {pj}
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            PJ
          </span>
        </div>
      </div>

      <div className="flex gap-4 text-xs font-semibold">
        <div className="flex flex-col items-center">
          <span className="text-emerald-500 text-lg font-black leading-none">
            {g}
          </span>
          <span className="text-slate-400 uppercase tracking-wide">G</span>
          <span className="text-slate-500">{pct(g, pj)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-amber-400 text-lg font-black leading-none">
            {e}
          </span>
          <span className="text-slate-400 uppercase tracking-wide">E</span>
          <span className="text-slate-500">{pct(e, pj)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-red-500 text-lg font-black leading-none">
            {p}
          </span>
          <span className="text-slate-400 uppercase tracking-wide">P</span>
          <span className="text-slate-500">{pct(p, pj)}%</span>
        </div>
      </div>
    </div>
  );
};

export default DonutChart; // 👈 CAMBIO: export correcto

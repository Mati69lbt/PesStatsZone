import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function PointsLineChart({ chartData, yMax }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          padding: 14,
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => `Partido ${items?.[0]?.label ?? ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true, // 👈 verticales
          drawBorder: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6, // 👈 clave para mobile
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        min: 0,
        max: yMax || 0,
        ticks: { precision: 0 },
        grid: { drawBorder: false },
      },
    },
  };

  return (
    <div
      className={[
        "w-full rounded-2xl border border-slate-200 bg-white shadow-sm",
        "p-2 sm:p-4",
        "h-[18rem] sm:h-[22rem] md:h-96", // 👈 mejora vertical en celu
      ].join(" ")}
    >
      <Line data={chartData} options={options} />
    </div>
  );
}

import React from "react";

export default function SegmentedTabs({ value, onChange }) {
  const btn = (k, label) => (
    <button
      key={k}
      onClick={() => onChange(k)}
      className={[
        "flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
        value === k
          ? "bg-slate-900 text-white shadow"
          : "bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto flex w-full max-w-md gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2">
      {btn("general", "General")}
      {btn("capitanes", "Capitanes")}
    </div>
  );
}

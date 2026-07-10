import React, { useMemo, useState } from "react";
import { pretty } from "../../match/utils/pretty";
import DonutChart, { calcStats } from "../components/DonutChart";
import GFvsGCChart, { buildGFvsGC } from "./GFvsGCChart";
import CondicionChart, { buildCondicionData } from "./Condicionchart";
import FormaReciente, { buildForma } from "./FormaReciente";

const CANTIDAD_FORMA = 16;

const Extras = ({ matches = [], torneosConfig = {} }) => {
  const [openSection, setOpenSection] = useState("");
  const toggle = (key) => setOpenSection((prev) => (prev === key ? null : key));

  // ── donut ──
  const statsGeneral = useMemo(() => calcStats(matches), [matches]);
  const captains = useMemo(() => {
    const map = new Map();
    for (const m of matches) {
      const cap = (m?.captain || "").trim();
      if (!cap) continue;
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(m);
    }
    return Array.from(map.entries())
      .map(([cap, ms]) => ({ cap, stats: calcStats(ms) }))
      .filter((c) => c.stats.pj > 0)
      .sort((a, b) => b.stats.pj - a.stats.pj);
  }, [matches]);

  // ── GF vs GC ──
  const gfGcData = useMemo(() => buildGFvsGC(matches), [matches]);

  // GF vs GC desglosado por capitán
  const gfGcPorCapitan = useMemo(() => {
    const map = new Map();
    for (const m of matches) {
      const cap = (m?.captain || "").trim();
      if (!cap) continue;
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(m);
    }
    return Array.from(map.entries())
      .map(([cap, ms]) => ({ cap, data: buildGFvsGC(ms) }))
      .filter((c) => c.data.length > 0)
      .sort((a, b) => {
        const pjA = a.data.reduce((s, d) => s + d.pj, 0);
        const pjB = b.data.reduce((s, d) => s + d.pj, 0);
        return pjB - pjA;
      });
  }, [matches]);

  // ── condición ──────────────────────────────────────────────────────────────
  const condicionGeneral = useMemo(
    () => buildCondicionData(matches),
    [matches],
  );

  const condicionPorCapitan = useMemo(() => {
    const map = new Map();
    for (const m of matches) {
      const cap = (m?.captain || "").trim();
      if (!cap) continue;
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(m);
    }
    return Array.from(map.entries())
      .map(([cap, ms]) => ({ cap, data: buildCondicionData(ms) }))
      .filter(({ data }) =>
        ["local", "visitante", "neutro"].some((c) => data[c].pj > 0),
      )
      .sort((a, b) => {
        const pjA = ["local", "visitante", "neutro"].reduce(
          (s, c) => s + a.data[c].pj,
          0,
        );
        const pjB = ["local", "visitante", "neutro"].reduce(
          (s, c) => s + b.data[c].pj,
          0,
        );
        return pjB - pjA;
      });
  }, [matches]);

  // ── forma reciente ─────────────────────────────────────────────────────────
  const formaGeneral = useMemo(
    () => buildForma(matches, CANTIDAD_FORMA),
    [matches],
  );

  const formaPorCapitan = useMemo(() => {
    const map = new Map();
    for (const m of matches) {
      const cap = (m?.captain || "").trim();
      if (!cap) continue;
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(m);
    }
    return Array.from(map.entries())
      .map(([cap, ms]) => ({ cap, forma: buildForma(ms, CANTIDAD_FORMA) }))
      .filter((c) => c.forma.length > 0)
      .sort((a, b) => b.forma.length - a.forma.length);
  }, [matches]);

  return (
    <div className="space-y-3">
      {/* ── 🍩 Donut G/E/P ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggle("donut")}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 focus:outline-none"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
            🍩 G / E / P
          </h2>
          <span
            className={`text-slate-400 text-xs transition-transform duration-200 ${openSection === "donut" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {openSection === "donut" && (
          <div className="p-3 space-y-4">
            <div className="max-w-[220px] mx-auto">
              <DonutChart title="General" stats={statsGeneral} size="lg" />
            </div>
            {captains.length > 0 && (
              <>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
                  Por capitán
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {captains.map(({ cap, stats }) => (
                    <DonutChart key={cap} title={pretty(cap)} stats={stats} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* ── 📊 GF vs GC por torneo ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggle("gfgc")}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 focus:outline-none"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
            📊 GF vs GC por torneo
          </h2>
          <span
            className={`text-slate-400 text-xs transition-transform duration-200 ${openSection === "gfgc" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {openSection === "gfgc" && (
          <div className="p-3 space-y-6">
            {/* General */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-2">
                General
              </p>
              <GFvsGCChart data={gfGcData} />
            </div>

            {/* Por capitán */}
            {gfGcPorCapitan.length > 0 && (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-4">
                    Por capitán
                  </p>
                  <div className="space-y-6">
                    {gfGcPorCapitan.map(({ cap, data }) => (
                      <div key={cap}>
                        <p className="text-xs font-bold text-slate-600 mb-1 px-1">
                          🧤 {pretty(cap)}
                        </p>
                        <GFvsGCChart data={data} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* ── 🏠 Local vs Visitante vs Neutral ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggle("condicion")}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 focus:outline-none"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
            🏠 Local vs Visitante vs Neutral
          </h2>
          <span
            className={`text-slate-400 text-xs transition-transform duration-200 ${openSection === "condicion" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {openSection === "condicion" && (
          <div className="p-3 space-y-6">
            {/* General */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-2">
                General
              </p>
              <CondicionChart data={condicionGeneral} />
            </div>

            {/* Por capitán */}
            {condicionPorCapitan.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-4">
                  Por capitán
                </p>
                <div className="space-y-8">
                  {condicionPorCapitan.map(({ cap, data }) => (
                    <div key={cap}>
                      <p className="text-xs font-bold text-slate-600 mb-2 px-1">
                        🧤 {pretty(cap)}
                      </p>
                      <CondicionChart data={data} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── 🔥 Forma reciente ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggle("forma")}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 focus:outline-none"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
            🔥 Forma reciente
            <span className="ml-2 text-[10px] font-semibold text-slate-400 normal-case">
              últimos {CANTIDAD_FORMA}
            </span>
          </h2>
          <span
            className={`text-slate-400 text-xs transition-transform duration-200 ${openSection === "forma" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>
        {openSection === "forma" && (
          <div className="p-3 space-y-6">
            {/* General */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3">
                General
              </p>
              <FormaReciente matches={matches} cantidad={CANTIDAD_FORMA} />
            </div>

            {/* Por capitán */}
            {formaPorCapitan.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-4">
                  Por capitán
                </p>
                <div className="space-y-6">
                  {formaPorCapitan.map(({ cap, forma }) => (
                    <div key={cap}>
                      <p className="text-xs font-bold text-slate-600 mb-2 px-1">
                        🧤 {pretty(cap)}
                      </p>
                      <FormaReciente
                        matches={forma}
                        cantidad={CANTIDAD_FORMA}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Extras;

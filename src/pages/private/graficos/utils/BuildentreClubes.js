// ── outcome ───────────────────────────────────────────────────────────────────
const getOutcome = (m) => {
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

const pct = (g, e, pj) =>
  pj > 0 ? Math.round(((g * 3 + e) / (pj * 3)) * 100) : 0;

// ── builder principal ─────────────────────────────────────────────────────────
export const buildClubsData = (lineupsObj) => {
  return Object.entries(lineupsObj)
    .map(([clubKey, bucket]) => {
      const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];
      const label = bucket?.label || clubKey;

      // stats generales
      const base = { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 };
      for (const m of matches) {
        const o = getOutcome(m);
        base.pj++;
        base[o]++;
        base.gf += Number(m?.golFavor || 0);
        base.gc += Number(m?.golContra || 0);
      }
      base.dif = base.gf - base.gc;
      base.efec = pct(base.g, base.e, base.pj);
      base.avgGf =
        base.pj > 0 ? Math.round((base.gf / base.pj) * 100) / 100 : 0;
      base.avgGc =
        base.pj > 0 ? Math.round((base.gc / base.pj) * 100) / 100 : 0;

      // por año
      const byYear = {};
      for (const m of matches) {
        const year =
          m?.torneoYear || (m?.fecha ? new Date(m.fecha).getFullYear() : null);
        if (!year) continue;
        if (!byYear[year])
          byYear[year] = { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 };
        const o = getOutcome(m);
        byYear[year].pj++;
        byYear[year][o]++;
        byYear[year].gf += Number(m?.golFavor || 0);
        byYear[year].gc += Number(m?.golContra || 0);
      }
      for (const s of Object.values(byYear)) s.efec = pct(s.g, s.e, s.pj);

      // mejor temporada
      let bestYear = null;
      for (const [year, s] of Object.entries(byYear)) {
        if (
          !bestYear ||
          s.efec > bestYear.efec ||
          (s.efec === bestYear.efec && s.pj > bestYear.pj)
        ) {
          bestYear = { year, ...s };
        }
      }

      // racha ganada más larga
      const sorted = [...matches].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha),
      );
      let maxStreak = 0,
        cur = 0;
      for (const m of sorted) {
        if (getOutcome(m) === "g") {
          cur++;
          maxStreak = Math.max(maxStreak, cur);
        } else cur = 0;
      }

      // forma reciente (últimos 10)
      const recentForm = [...matches]
        .filter((m) => m?.fecha)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 14)
        .map((m) => getOutcome(m));

      // capitanes
      const capsMap = {};
      for (const m of matches) {
        const cap = (m?.captain || "").trim();
        if (!cap) continue;
        if (!capsMap[cap]) capsMap[cap] = { pj: 0, g: 0, e: 0, p: 0 };
        capsMap[cap][getOutcome(m)]++;
        capsMap[cap].pj++;
      }
      const captains = Object.entries(capsMap)
        .map(([cap, s]) => ({ cap, ...s, efec: pct(s.g, s.e, s.pj) }))
        .sort((a, b) => b.pj - a.pj);

      const bestCaptain = captains.length
        ? [...captains].sort((a, b) => b.efec - a.efec || b.pj - a.pj)[0]
        : null;

      return {
        clubKey,
        label,
        ...base,
        byYear,
        bestYear,
        longestWinStreak: maxStreak,
        recentForm,
        captains,
        bestCaptain,
        matches,
      };
    })
    .filter((c) => c.pj > 0)
    .sort((a, b) => b.efec - a.efec || b.pj - a.pj);
};

// ── datos para línea temporal ─────────────────────────────────────────────────
export const buildYearLineData = (clubsData) => {
  const allYears = new Set();
  clubsData.forEach((c) =>
    Object.keys(c.byYear).forEach((y) => allYears.add(String(y))),
  );

  return Array.from(allYears)
    .sort()
    .map((year) => {
      const point = { year };
      clubsData.forEach((c) => {
        const s = c.byYear[year];
        point[c.label] = s ? s.efec : null;
      });
      return point;
    });
};

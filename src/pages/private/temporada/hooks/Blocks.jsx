import React, { useMemo } from "react";

const Blocks = (lineups = {}) => {
  const clubKeys = Object.keys(lineups || {});

  return useMemo(() => {
    const out = [];

    for (const ck of clubKeys) {
      const bucket = lineups?.[ck];
      const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];
      if (!matches.length) continue;

      const byYear = new Map();

      for (const m of matches) {
        const d = new Date(m?.fecha);
        if (!Number.isFinite(d.getTime())) continue;
        const y = String(d.getFullYear());
        if (!byYear.has(y)) byYear.set(y, []);
        byYear.get(y).push(m);
      }

      for (const [year, matchesForYear] of byYear.entries()) {
        out.push({ clubKey: ck, year, bucket, matchesForYear });
      }
    }

    out.sort((a, b) => Number(b.year) - Number(a.year));
    return out;
  }, [clubKeys.join("|"), lineups]);
};

export default Blocks;

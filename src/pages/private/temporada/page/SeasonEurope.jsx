import React, { useMemo } from "react";
import SeasonBlock from "../hooks/SeasonBlock";
import { buildEuropeanBlocks } from "../utils/EuropeFuntions";

const SeasonEurope = ({ lineups = {} }) => {
    const blocks = useMemo(() => {
      const out = [];
      const clubKeys = Object.keys(lineups || {});

      for (const ck of clubKeys) {
        const bucket = lineups?.[ck];
        const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];
        if (!matches.length) continue;

        const blocksClub = buildEuropeanBlocks(matches, ck, bucket);
        for (const b of blocksClub) {
          out.push(b);
        }
      }

      // ordenar por temporada desc (más nueva primero)
      out.sort((a, b) => {
        const a0 = parseInt(String(a.seasonKey).split("-")[0], 10);
        const b0 = parseInt(String(b.seasonKey).split("-")[0], 10);
        return b0 - a0;
      });

      return out;
    }, [lineups]);

    return (
      <>
        {blocks.map((b) => (
          <SeasonBlock
            key={`${b.seasonKey}-${b.clubKey}`}
            clubKey={b.clubKey}
            bucket={b.bucket}
            year={b.seasonKey} // "2024-2025"
            matchesForYear={b.matchesForSeason}
            mode="europeo"
          />
        ))}
      </>
    );
};

export default SeasonEurope;

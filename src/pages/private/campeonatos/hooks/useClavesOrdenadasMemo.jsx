// cspell: ignore resumenes
import React, { useMemo } from "react";

const useClavesOrdenadasMemo = (resumenes, orden) => {
  return useMemo(() => {
    const extractEndYear = (str) => {
      const match = String(str).match(/(\d{4})(?:-(\d{4}))?$/);
      if (!match) return 0;
      return parseInt(match[2] || match[1], 10);
    };
    const arr = Object.keys(resumenes);
    arr.sort((a, b) =>
      orden === "asc"
        ? extractEndYear(a) - extractEndYear(b)
        : extractEndYear(b) - extractEndYear(a)
    );
    return arr;
  }, [resumenes, orden]);
};

export default useClavesOrdenadasMemo;

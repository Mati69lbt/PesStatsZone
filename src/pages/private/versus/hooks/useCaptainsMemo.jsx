import React, { useMemo } from "react";

const useCaptainsMemo = (matches = []) => {
  return useMemo(() => {
    const set = new Set();
    for (const m of matches) {
      const c = (m?.captain || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set);
  }, [matches]);
};

export default useCaptainsMemo;

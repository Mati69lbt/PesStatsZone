import { useMemo } from "react";
import { getOutcome } from "../utils/utils";


const blank = () => ({
  total: 0,
  g: 0,
  e: 0,
  p: 0,
  gp: 0,
  gf: 0,
  gc: 0,
  dif: 0,
});

const addMatch = (acc, m) => {
  acc.total += 1;

  const o = getOutcome(m);
  if (o === "GANADO") acc.g += 1;
  else if (o === "PERDIDO") acc.p += 1;
  else acc.e += 1;

  acc.gf += Number(m?.golFavor ?? 0);
  acc.gc += Number(m?.golContra ?? 0);

  acc.gp = acc.g - acc.p;
  acc.dif = acc.gf - acc.gc;
};

const cond = (m) =>
  String(m?.condition ?? "")
    .trim()
    .toLowerCase();

const isLocal = (m) => cond(m) === "local";
const isVisitante = (m) => cond(m) === "visitante";

export const useResumen = (filteredMatches) => {
  return useMemo(() => {
    const list = Array.isArray(filteredMatches) ? filteredMatches : [];

    const overall = blank();
    const local = blank();
    const visitante = blank();

    for (const m of list) {
      addMatch(overall, m);
      if (isLocal(m)) addMatch(local, m);
      else if (isVisitante(m)) addMatch(visitante, m);
    }

    return { ...overall, local, visitante };
  }, [filteredMatches]);
};

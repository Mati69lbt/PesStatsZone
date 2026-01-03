// cspell: ignore resumenes
import React, { useMemo } from "react";
import { temporadaKey } from "../util/funtions"; // <-- CAMBIO: nuevo import

const toMs = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : 0;
  }
  if (typeof v === "object") {
    if (typeof v.toDate === "function") {
      const d = v.toDate();
      return d instanceof Date ? d.getTime() : 0;
    }
    if (typeof v.seconds === "number") return v.seconds * 1000;
  }
  return 0;
};

const useClavesOrdenadasMemo = (resumenes, orden, matches = []) => {
  // <-- CAMBIO: matches opcional
  return useMemo(() => {
    const extractEndYear = (str) => {
      const match = String(str).match(/(\d{4})(?:-(\d{4}))?$/);
      if (!match) return 0;
      return parseInt(match[2] || match[1], 10);
    };

    // <-- CAMBIO: armamos "recencia" por clave (último partido del torneo)
    const maxTsByClave = new Map();
    (matches || []).forEach((m) => {
      const key = temporadaKey({
        torneoName: m?.torneoName,
        torneoYear: m?.torneoYear,
        fecha: m?.fecha,
      });

      const ts = Math.max(toMs(m?.createdAt), toMs(m?.fecha));
      if (!ts) return;

      const prev = maxTsByClave.get(key) || 0;
      if (ts > prev) maxTsByClave.set(key, ts);
    });

    const arr = Object.keys(resumenes || {});
    arr.sort((a, b) => {
      const ya = extractEndYear(a);
      const yb = extractEndYear(b);

      // 1) año
      if (ya !== yb) return orden === "asc" ? ya - yb : yb - ya;

      // 2) dentro del mismo año: torneo más reciente arriba/abajo según orden
      const ta = maxTsByClave.get(a) || 0;
      const tb = maxTsByClave.get(b) || 0;
      if (ta !== tb) return orden === "asc" ? ta - tb : tb - ta;

      // 3) fallback estable
      return a.localeCompare(b);
    });

    return arr;
  }, [resumenes, orden, matches]);
};

export default useClavesOrdenadasMemo;

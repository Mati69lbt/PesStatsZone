import { useMemo } from "react";
import { golesDeItem, nombreDeItem } from "../utils/utils";


// rows: [{ name, pj, g, x2, x3 }]
const buildTabla = (matches, getter) => {
  const map = new Map();

  (matches ?? []).forEach((m) => {
    const arr = getter(m);
    if (!Array.isArray(arr) || arr.length === 0) return;

    // PJ: sumar 1 por partido si el jugador aparece en ese match
    const seen = new Set();

    arr.forEach((it) => {
      const name = nombreDeItem(it);
      if (!name) return;

      const key = name.toLowerCase();
      const prev = map.get(key) ?? { name, pj: 0, g: 0, x2: 0, x3: 0 };

      prev.g += golesDeItem(it);

      // contadores de eventos
      if (typeof it === "object") {
        if (it.doblete) prev.x2 += 1;
        if (it.triplete || it.hattrick) prev.x3 += 1;
      }

      map.set(key, prev);
      seen.add(key);
    });

    seen.forEach((k) => {
      const row = map.get(k);
      if (row) row.pj += 1;
    });
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      b.g - a.g || b.x3 - a.x3 || b.x2 - a.x2 || a.name.localeCompare(b.name),
  );
};

// OJO: usan hooks => llamalas dentro del componente
export const goleadoresClub = (orderedMatches) =>
  useMemo(
    () => buildTabla(orderedMatches, (m) => m?.goleadoresActiveClub ?? []),
    [orderedMatches],
  );

export const goleadoresRival = (orderedMatches) =>
  useMemo(
    () => buildTabla(orderedMatches, (m) => m?.goleadoresRivales ?? []),
    [orderedMatches],
  );

// FiltroTorneo.jsx
import { useEffect, useMemo, useState } from "react";
import { normalizeName } from "../../../../utils/normalizeName";


// Hook: lógica separada para filtrar por torneoName
export function useFiltroTorneo(matches = []) {
  const getTorneoRaw = (m) => String(m?.torneoName ?? "").trim();
  const getTorneoKey = (m) => normalizeName(getTorneoRaw(m));

  const torneoOptions = useMemo(() => {
    const map = new Map();
    let hasNone = false;

    for (const m of matches) {
      const raw = getTorneoRaw(m);
      if (!raw) {
        hasNone = true;
        continue;
      }
      map.set(getTorneoKey(m), raw);
    }

    const opts = Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "es", { sensitivity: "base" })
      );

    const base = [{ value: "__all", label: "Todos" }];
    if (hasNone) base.push({ value: "__none", label: "(Sin torneo)" });

    return [...base, ...opts];
  }, [matches]);

  const [torneoSel, setTorneoSel] = useState("__all");

  // Si cambiás de club y el torneo ya no existe en ese club, volvemos a "Todos"
  useEffect(() => {
    if (!torneoOptions.some((o) => o.value === torneoSel)) {
      setTorneoSel("__all");
    }
  }, [torneoOptions, torneoSel]);

  const matchesFiltrados = useMemo(() => {
    if (torneoSel === "__all") return matches;
    if (torneoSel === "__none") return matches.filter((m) => !getTorneoRaw(m));
    return matches.filter((m) => getTorneoKey(m) === torneoSel);
  }, [matches, torneoSel]);

  return { torneoSel, setTorneoSel, torneoOptions, matchesFiltrados };
}

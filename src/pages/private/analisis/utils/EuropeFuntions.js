const norm = (s) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function getEuropeanSeasonKey(fechaISO) {
  const d = new Date(fechaISO);
  if (!Number.isFinite(d.getTime())) return "N/A";

  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1..12
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`; // "2024-2025"
}

export function getFormatoTorneo(torneosConfig, torneoName) {
  if (!torneosConfig || !torneoName) return "anual";

  const target = norm(torneoName);

  // intenta match exacto por key
  if (torneosConfig[torneoName]?.formato)
    return torneosConfig[torneoName].formato;

  // intenta match por normalización (Bundesliga vs bundesliga, etc.)
  for (const [k, v] of Object.entries(torneosConfig)) {
    if (norm(k) === target) return v?.formato || "anual";
  }

  return "anual";
}

export function getSeasonKeyForMatch(m, torneosConfig, mode = "anual") {
  const d = new Date(m?.fecha);
  if (!Number.isFinite(d.getTime())) return "N/A";

  // si estoy en vista anual, fuerzo anual para todo
  if (mode !== "europeo") return String(d.getFullYear());

  const torneo = m?.torneoName || m?.torneoDisplay || "";
  const formato = getFormatoTorneo(torneosConfig, torneo);

  if (formato === "europeo") return getEuropeanSeasonKey(m.fecha);

  // default: anual
  return String(d.getFullYear());
}

export function sortKeyFromSeasonLabel(label) {
  // sirve para "2024" y "2024-2025"
  const years = String(label).match(/\d{4}/g) || [];
  return years.length ? Math.max(...years.map(Number)) : -Infinity;
}

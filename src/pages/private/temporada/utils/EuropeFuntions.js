export function getEuropeanSeasonKey(fechaISO) {
  // fechaISO tipo "2025-03-02" o "2025-03-02T..."
  const d = new Date(fechaISO);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1..12

  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`; // "2024-2025"
}

export function buildEuropeanBlocks(matches, clubKey, bucket) {
  // matches: array de partidos (cada uno con .fecha)
  const map = new Map();

  for (const m of matches) {
    const seasonKey = getEuropeanSeasonKey(m.fecha); // ajustá si tu campo se llama distinto
    if (!map.has(seasonKey)) map.set(seasonKey, []);
    map.get(seasonKey).push(m);
  }

  // ordenar por temporada desc (más nueva primero)
  const seasons = Array.from(map.keys()).sort((a, b) => {
    const a0 = parseInt(a.split("-")[0], 10);
    const b0 = parseInt(b.split("-")[0], 10);
    return b0 - a0;
  });

  return seasons.map((seasonKey) => ({
    seasonKey, // "2024-2025"
    clubKey,
    bucket,
    matchesForSeason: map.get(seasonKey),
  }));
}

export const calcularGolesGoleador = (g) => {
  if (!g) return 0;

  const t = !!(g.triplete || g.hattrick);

  if (t && g.doblete && g.gol) return 6;
  if (t && g.doblete) return 5;
  if (t && g.gol) return 4;
  if (t) return 3;

  if (g.doblete) return 2;
  if (g.gol) return 1;

  return 0;
};

export const getMatchYear = (m) => {
  const y = m?.torneoYear ?? m?.tournamentYear ?? m?.year ?? m?.anio;
  if (y !== undefined && y !== null) return String(y);

  // fallback: si alguna key trae "...._2019"
  const key =
    m?.torneoKey || m?.tournamentKey || m?.torneo || m?.competitionKey || "";
  const mm = String(key).match(/(\d{4})/);
  return mm ? mm[1] : null;
};

export const buildListFromMap = (map, limit, pjMapSource, clubMapSource) =>
  Object.entries(map || {})
    .map(([name, goals]) => {
      const pj = pjMapSource?.[name] || 0;
      return {
        name,
        goals,
        pj,
        prom: pj > 0 ? goals / pj : 0,
        club: clubMapSource?.[name] || "",
      };
    })
    .filter((x) => x.goals > 0) // 🔥 Importante: Solo los que metieron goles
    .sort((a, b) => {
      const diff = b.goals - a.goals; // Ordenar por goles DESC
      if (diff !== 0) return diff;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    })
    .slice(0, limit); // 🔥 Aplicar el límite (topN)

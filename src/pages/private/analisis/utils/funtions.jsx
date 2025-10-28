export const emptyRow = () => ({
  pj: 0,
  g: 0,
  e: 0,
  p: 0,
  gf: 0,
  gc: 0,
  dif: 0,
});
export const emptyTriple = () => ({
  General: emptyRow(),
  Local: emptyRow(),
  Visitante: emptyRow(),
});

export function sumInto(dst, m) {
  dst.pj += 1;
  const gf = Number(m.golFavor || 0);
  const gc = Number(m.golContra || 0);
  dst.gf += gf;
  dst.gc += gc;
  if (gf > gc) dst.g += 1;
  else if (gf === gc) dst.e += 1;
  else dst.p += 1;
  dst.dif = dst.gf - dst.gc;
}

export function addMatchToTriple(triple, m) {
  // siempre suma a General
  sumInto(triple.General, m);

  // normaliza condition
  const cond = String(m?.condition || "").toLowerCase();
  if (cond === "local") sumInto(triple.Local, m);
  else if (cond === "visitante") sumInto(triple.Visitante, m);
  // si es "neutral" => ya quedó sólo en General (pedido tuyo)
}

/** Devuelve un array de { captain, total: triple, byTournament: { [torneoDisplay]: triple } } */
export function buildBreakdown(matches) {
  const byCaptain = new Map(); // captain => { captain, total: Triple, byTournament: { name: Triple }, tourneyMaxTs: {name: ts} }

  for (const m of matches || []) {
    const captain = (m?.captain || "—").trim();
    if (!byCaptain.has(captain)) {
      byCaptain.set(captain, {
        captain,
        total: emptyTriple(),
        byTournament: {},
        tourneyMaxTs: {},
      });
    }
    const node = byCaptain.get(captain);

    // Totales del capitán
    addMatchToTriple(node.total, m);

    // Por torneo
    const tName = m?.torneoDisplay || "Sin torneo";
    if (!node.byTournament[tName]) node.byTournament[tName] = emptyTriple();
    addMatchToTriple(node.byTournament[tName], m);

    // Recencia por torneo (por fecha o createdAt)
    const ts = m?.createdAt ?? (m?.fecha ? new Date(m.fecha).getTime() : 0);
    node.tourneyMaxTs[tName] = Math.max(node.tourneyMaxTs[tName] || 0, ts);
  }

  // Ordena capitanes alfabéticamente (pedido tuyo)
  const captains = [...byCaptain.values()].sort((a, b) =>
    a.captain.localeCompare(b.captain)
  );

  // Conjunto de torneos global para alinear columnas entre capitanes
  const allTournaments = new Map(); // name => maxTsGlobal
  captains.forEach((c) => {
    Object.entries(c.tourneyMaxTs).forEach(([name, ts]) => {
      allTournaments.set(name, Math.max(allTournaments.get(name) || 0, ts));
    });
  });

  // Orden torneos: recientes primero
  const tournamentsOrdered = [...allTournaments.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return { captains, tournamentsOrdered };
}

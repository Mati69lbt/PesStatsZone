export const ordenarRachas = (lista = [], key, dir) => {
  const items = [...lista];
  const isAsc = dir === "asc";

  return items.sort((a, b) => {
    let valA, valB;

    switch (key) {
      case "alfabetico":
        valA = (a.club || "").toLowerCase();
        valB = (b.club || "").toLowerCase();
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);

      case "pj":
        valA = Number(a.partidosTotales || a.racha || 0);
        valB = Number(b.partidosTotales || b.racha || 0);
        break;

      case "fecha":
        valA = new Date(a.fechaFin || 0).getTime();
        valB = new Date(b.fechaFin || 0).getTime();
        break;

      case "ganados":
        valA = Number(a.ganados || 0);
        valB = Number(b.ganados || 0);
        break;

      case "empatados":
        valA = Number(a.empatados || 0);
        valB = Number(b.empatados || 0);
        break;

      case "goles":
        valA = Number(
          a.golesFavor || a.golesContra || a.goles || a.acumulados || 0,
        );
        valB = Number(
          b.golesFavor || b.golesContra || b.goles || b.acumulados || 0,
        );
        break;

      case "racha":
      default:
        valA = Number(
          a.rachaInvicta ||
            a.rachaVictorias ||
            a.rachaEmpates ||
            a.rachaDerrotas ||
            a.rachaAnotando ||
            a.rachaRecibiendo ||
            a.rachaVallas ||
            a.rachaSinMarcar ||
            0,
        );
        valB = Number(
          b.rachaInvicta ||
            b.rachaVictorias ||
            b.rachaEmpates ||
            b.rachaDerrotas ||
            b.rachaAnotando ||
            b.rachaRecibiendo ||
            b.rachaVallas ||
            b.rachaSinMarcar ||
            0,
        );
        break;
    }

    if (valA === valB) return 0;
    return isAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });
};

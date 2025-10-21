import React from "react";


const makeHandleChangeCaptainSelect = (lineups, activeClub, matchDispatch) => {
  return (captain) => {
    const raw = lineups?.[activeClub]?.formations;

    // 🔧 Normalizar a array
    const formations = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object"
      ? Object.values(raw)
      : [];

    // Buscar la formación cuyo capitán coincide
    const formation = formations.find((f) => (f?.captain || "") === captain);

    // Titulares seguros (array) o vacío
    const starters = Array.isArray(formation?.starters) ? formation.starters : [];

    // Despachar al reducer del partido
    matchDispatch({
      type: "SET_FORMACION",
      payload: { captain, starters },
    });
  };
};

export default makeHandleChangeCaptainSelect;




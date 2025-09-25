import React from "react";

const makeHandleChangeCaptainSelect = (lineups, activeClub, matchDispatch) => {
  return (captain) => {
    const formation = (lineups?.[activeClub]?.formations || []).find(
      (f) => f.captain === captain
    );
    matchDispatch({
      type: "SET_FORMACION",
      payload: { captain, starters: formation?.starters || [] },
    });
  };
};

export default makeHandleChangeCaptainSelect;

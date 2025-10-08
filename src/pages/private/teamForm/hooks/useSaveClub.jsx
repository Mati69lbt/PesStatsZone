import React, { useEffect } from "react";
import {
  CLUB_LOAD_FROM_ACTIVE,
  SAVE_CLUB_NAME,
} from "../../../../context/LineUpProvider";

const useSaveClub = (lineups, activeClub, dispatch, hydrated) => {
  useEffect(() => {
    if (!hydrated) return;
    const keys = Object.keys(lineups || {});
    if (!keys.length || activeClub) return;

    const clubKey = keys[0];
    dispatch({ type: SAVE_CLUB_NAME, payload: { name: clubKey } });
    dispatch({ type: CLUB_LOAD_FROM_ACTIVE });
  }, [lineups, activeClub, dispatch, hydrated]);
};

export default useSaveClub;

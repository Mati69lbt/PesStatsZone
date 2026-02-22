import React, { useMemo } from "react";
import { getPlayedPlayers } from "../utils/utils";

const usePlayed = (filteredMatches = []) => {
  return useMemo(() => {
    // OJO: usá filteredMatches porque ya son los partidos vs selectedRival
    const map = new Map();

    filteredMatches.forEach((m) => {
      const players = getPlayedPlayers(m);
      players.forEach((pKey) => {
        map.set(pKey, (map.get(pKey) ?? 0) + 1);
      });
    });

    return map;
  }, [filteredMatches]);
};

export default usePlayed;

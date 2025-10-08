import React, { useMemo } from 'react'

const usePartitionPlayers = (players = [], starters = []) => {
 return useMemo(() => {
   const safePlayers = Array.isArray(players) ? players : [];
   const safeStarters = Array.isArray(starters) ? starters : [];

   const remaining = safePlayers
     .filter((p) => !safeStarters.includes(p))
     .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

   const chosen = safePlayers
     .filter((p) => safeStarters.includes(p))
     .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

   return { remaining, chosen };
 }, [players, starters]);
}

export default usePartitionPlayers
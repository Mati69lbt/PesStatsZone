import React, { useEffect } from 'react'
import { pretty } from '../../match/utils/pretty';


const useSetTeamName = (activeClub, lineups, setTeamName) => {
 useEffect(() => {
   if (!activeClub) {
     setTeamName("");
     return;
   }

   const label = lineups?.[activeClub]?.label || activeClub;
   const next = pretty(label);
 
   setTeamName((prev) => (prev === next ? prev : next));
 }, [activeClub, lineups, setTeamName]);
};

export default useSetTeamName
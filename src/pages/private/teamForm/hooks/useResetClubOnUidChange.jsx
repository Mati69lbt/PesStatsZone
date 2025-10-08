import React, { useEffect } from 'react'
import { CLUB_RESET, LINEUPS_UPSERT_BUCKET } from '../../../../context/LineUpProvider';


const useResetClubOnUidChange = (uid, dispatch) => {
  useEffect(() => {
    if (!uid) {
      dispatch({ type: CLUB_RESET });    
      dispatch({
        type: LINEUPS_UPSERT_BUCKET,
        payload: { club: "", bucket: {} },
      });
    }
  }, [uid, dispatch]);
}

export default useResetClubOnUidChange
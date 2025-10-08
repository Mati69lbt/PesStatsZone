// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import React, { useEffect } from "react";
import { normalizeName } from "../../../../utils/normalizeName";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../../configuration/firebase";


const useUpdateLineup = (uid, activeClub, lineups, players) => {
  useEffect(() => {
    if (!uid) return;
    if (!activeClub) return;

    const clubKey = normalizeName(activeClub);
    if (!clubKey) return;

    if (!lineups[clubKey]) return;

    const t = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "users", uid), {
          [`lineups.${clubKey}.players`]: players,
          [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
        });
        Notiflix.Notify.success("Plantel sincronizado");
      } catch (e) {
        console.error(e);
        Notiflix.Notify.failure("No se pudo sincronizar el plantel");
      }
    }, 400);

    return () => clearTimeout(t);
  }, [uid, activeClub, lineups, players]);
};

export default useUpdateLineup;

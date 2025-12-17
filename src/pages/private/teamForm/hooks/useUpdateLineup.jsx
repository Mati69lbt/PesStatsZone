// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import { useEffect, useRef } from "react";
import { normalizeName } from "../../../../utils/normalizeName";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../../configuration/firebase";

const useUpdateLineup = (uid, activeClub, lineups, players) => {
  const lastSentRef = useRef({ clubKey: null, playersJson: "" });

  useEffect(() => {
    if (!uid) {
      console.debug("[SYNC] skip: !uid");
      return;
    }
    if (!activeClub) {
      console.debug("[SYNC] skip: !activeClub");
      return;
    }

    const clubKey = normalizeName(activeClub);
    if (!clubKey) {
      console.debug("[SYNC] skip: !clubKey (normalizeName dio vacío)");
      return;
    }

    if (!Array.isArray(players)) {
      console.debug("[SYNC] skip: !Array.isArray(players)", { players });
      return;
    }

    const playersNorm = [...new Set(players.map(normalizeName))];
    if (playersNorm.length === 0) {
      console.debug("[SYNC] skip: playersNorm vacío, no subo nada");
      return;
    }

    const payloadJson = JSON.stringify(playersNorm);
    const prev = lastSentRef.current;
    if (prev.clubKey === clubKey && prev.playersJson === payloadJson) {
      console.debug("[SYNC] skip: mismo payload que el último write");
      return;
    }

    (async () => {
      try {        
        await updateDoc(doc(db, "users", uid), {
          [`lineups.${clubKey}.players`]: playersNorm,
          [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
        });
        lastSentRef.current = { clubKey, playersJson: payloadJson };
        Notiflix.Notify.success("Plantel sincronizado");      
      } catch (e) {
        console.debug("[SYNC] FAIL", e);
        Notiflix.Notify.failure("No se pudo sincronizar el plantel");
      }
    })();
  }, [uid, activeClub, players]);
};

export default useUpdateLineup;

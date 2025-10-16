// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import { useEffect } from "react";
import { normalizeName } from "../../../../utils/normalizeName";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../../configuration/firebase";

const useUpdateLineup = (uid, activeClub, lineups, players) => {
  useEffect(() => {
    if (!uid) return;
    if (!activeClub) return;

    const clubKey = normalizeName(activeClub);
    if (!clubKey) return;

    const bucket = lineups?.[clubKey];
    if (!bucket) return;

    if (!Array.isArray(players)) return;

    const playersNorm = [...new Set(players.map(normalizeName))];
    const bucketPlayersNorm = [
      ...new Set((bucket.players || []).map(normalizeName)),
    ];

    // ⚠️ no subas vacíos si el bucket ya tenía jugadores (evita “limpiar” por el reset)
    if (playersNorm.length === 0 && bucketPlayersNorm.length > 0) return;

    // si no cambió nada, no escribas
    const sameLen = playersNorm.length === bucketPlayersNorm.length;
    const sameAll =
      sameLen && playersNorm.every((p, i) => p === bucketPlayersNorm[i]);
    if (sameAll) return;

    const t = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "users", uid), {
          [`lineups.${clubKey}.players`]: playersNorm,
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

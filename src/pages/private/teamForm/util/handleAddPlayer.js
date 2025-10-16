// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { LINEUPS_UPSERT_BUCKET } from "../../../../context/LineUpProvider";

const handleAddPlayer = ({ name, activeClub, lineups, dispatch, setValue }) => {
  const clubKey = normalizeName(activeClub || "");
  const n = normalizeName(name || "");
  if (!clubKey || !n) return;

  if (n.length < 2) {
    Notiflix.Notify.failure("Nombre corto");
    return;
  }

  const current = (lineups?.[clubKey]?.players || []).map(normalizeName);
  if (current.includes(n)) {
    Notiflix.Notify.failure("Jugador repetido");
    return;
  }

  dispatch({
    type: "LINEUPS_UPSERT_BUCKET",
    payload: {
      club: clubKey,
      bucket: {
        ...(lineups?.[clubKey] || {}),
        players: [...current, n],
      },
    },
  });

  setValue?.("playerName", "");
  Notiflix.Notify.success("Jugador agregado");
};

export default handleAddPlayer;

// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { PLAYERS_ADD } from "../../../../context/LineUpProvider";


const handleAddPlayer = (form, players, dispatch, setValue) => {
  const name = normalizeName(form.playerName) || "";
  if (name.length < 2) {
    Notiflix.Notify.failure("Nombre Corto");
    return;
  }
  if (players.some((j) => normalizeName(j) === name)) {
    Notiflix.Notify.failure("Jugador repetido");
    return;
  }

  dispatch({ type: PLAYERS_ADD, payload: { name } });
  setValue("playerName", "");
  Notiflix.Notify.success("Jugador agregado");
};

export default handleAddPlayer;

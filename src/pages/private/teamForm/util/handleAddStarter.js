// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { LINEUP_ADD_STARTER } from "../../../../context/LineUpProvider";


const handleAddStarter = (selectedOption, starters, dispatch) => {
  const select = normalizeName(selectedOption);
  if (!select) {
    Notiflix.Notify.failure("Elegí un jugador");
    return;
  }
  if (starters.length >= 11) {
    Notiflix.Notify.warning("Ya hay 11");
    return;
  }
  if (starters.includes(select)) {
    Notiflix.Notify.warning("Ya está en titulares");
    return;
  }
  dispatch({ type: LINEUP_ADD_STARTER, payload: { player: select } });

  Notiflix.Notify.success("Titular agregado");
};

export default handleAddStarter;

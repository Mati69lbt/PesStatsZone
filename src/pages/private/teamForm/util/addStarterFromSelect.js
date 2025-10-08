// cspell: ignore Notiflix notiflix condicion hattrick
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { LINEUP_ADD_STARTER, LINEUP_SET_SELECTED } from "../../../../context/LineUpProvider";


const addStarterFromSelect = (raw, starters, dispatch) => {
  const select = normalizeName(raw || "");
  if (!select) return;
  if (starters.length >= 11) {
    Notiflix.Notify.warning("Ya hay 11");
    return;
  }
  if (starters.includes(select)) {
    Notiflix.Notify.warning("Ya está en titulares");
    return;
  }
  dispatch({ type: LINEUP_ADD_STARTER, payload: { player: select } });
  dispatch({ type: LINEUP_SET_SELECTED, payload: "" });
  Notiflix.Notify.success("Titular agregado");
};

export default addStarterFromSelect;

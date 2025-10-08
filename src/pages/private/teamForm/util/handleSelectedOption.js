// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { LINEUP_SET_CAPTAIN } from "../../../../context/LineUpProvider";
import { pretty } from "../../match/utils/pretty";


const handleSelectedOption = (selectedOption, players, starters, dispatch) => {
  if (!selectedOption) {
    Notiflix.Notify.failure("Elegí un capitán");
    return;
  }

  const normalized = normalizeName(selectedOption);

  if (!players.includes(normalized)) {
    Notiflix.Notify.failure("Capitán inválido");
    return;
  }

  if (starters.length >= 11 && !starters.includes(normalized)) {
    Notiflix.Notify.warning("Equipo Titular Completo");
    return;
  }

  dispatch({
    type: LINEUP_SET_CAPTAIN,
    payload: { captain: normalized },
  });
  Notiflix.Notify.success(`Capitán: ${pretty(normalized)}`);
};

export default handleSelectedOption;

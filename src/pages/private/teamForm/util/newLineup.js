// cspell: ignore Notiflix lenght notiflix firestore
import Notiflix from "notiflix";
import { LINEUP_RESET } from "../../../../context/LineUpProvider";

const newLineup = (teamName, setShowForm, dispatch) => {
  if (!teamName) {
    Notiflix.Notify.failure("¿Que Equipo dirigís?");
    return;
  }
  setShowForm(true);
  dispatch({ type: LINEUP_RESET });
};

export default newLineup;

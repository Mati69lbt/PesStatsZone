// cspell: ignore Notiflix notiflix condicion hattrick
import React from "react";
import Notiflix from "notiflix";
import { CLUB_RESET, LINEUP_RESET } from "../../../../context/LineUpProvider";


const handleNewCLub = (setShowForm, dispatch, setTeamName) => {
  Notiflix.Confirm.show(
    "Nuevos Horizontes",
    "¿Te vas a un nuevo Club??",
    "Sí, ya firme contrato",
    "no, apreté sin querer",
    () => {
      // ✅ si confirma
      setShowForm(false);
      dispatch({ type: LINEUP_RESET });
      dispatch({ type: CLUB_RESET });
      setTeamName("");
    },
    () => {
      // ❌ si cancela → no hagas nada
    }
  );
};

export default handleNewCLub;

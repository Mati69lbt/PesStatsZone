// cspell: ignore Notiflix firestore notiflix estadisticas
import React from "react";
import Notiflix from "notiflix";
import saveMatch from "./saveMatch";

const handleSaveMatch = async ({
  uid,
  matchState,
  activeClub,
  matchDispatch,
  navigate,
}) => {
  try {
    Notiflix.Loading.standard("Guardando partido... ⚽");

    console.log("[Partido] Guardando:", { uid, matchState, activeClub });
    const result = await saveMatch({ uid, matchState, activeClub });
    console.log("[Partido] Guardado OK:", result);

    Notiflix.Notify.success("Partido guardado correctamente ✅");
    matchDispatch({ type: "RESET_FORM" });
    navigate("/versus");
  } catch (error) {
    Notiflix.Notify.failure("Error al guardar el partido ❌");
    console.error("Error al guardar:", error);
  } finally {
    Notiflix.Loading.remove();
  }
};

export default handleSaveMatch;

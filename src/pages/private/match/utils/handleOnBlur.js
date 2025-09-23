// cspell: ignore Notiflix firestore notiflix estadisticas
import Notiflix from "notiflix";
import { pretty } from "./pretty";

export const makeHandleOnBlur = (matchDispatch, campo, mensajeError) => (e) => {
  const raw = (e.target.value || "").trim();
  if (!raw) {
    Notiflix.Notify.failure(mensajeError);
    return;
  }
  const formatted = pretty(raw);
  if (formatted !== raw) {
    matchDispatch({
      type: "ACTUALIZAR_CAMPO",
      campo,
      valor: formatted,
    });
  }
};

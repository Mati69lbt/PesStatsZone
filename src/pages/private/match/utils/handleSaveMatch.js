// cspell: ignore Notiflix notiflix condicion hattrick
import React from "react";
import Notiflix from "notiflix";
import saveMatch from "./saveMatch";
import { pretty } from "./pretty";

const handleSaveMatch = async ({
  uid,
  matchState,
  activeClub,
  matchDispatch,
  navigate,
}) => {
  // Suma de goles por banderas (x1, doblete=+2, triplete/hattrick=+3)
  const goalsFromFlags = (g) =>
    (g.gol ? 1 : 0) + (g.doblete ? 2 : 0) + (g.triplete || g.hattrick ? 3 : 0);

  // Goles de cada lado
  const own = (matchState?.goleadoresActiveClub || []).filter(
    (g) => g.activeClub === activeClub
  );
  const rivals = matchState?.goleadoresRivales || [];

  const ownGoals = own.reduce((acc, g) => acc + goalsFromFlags(g), 0);
  const rivalGoals = rivals.reduce((acc, g) => acc + goalsFromFlags(g), 0);

  const rivalName = matchState?.rival || "Rival";

  // Condición (acepta 'condition' o 'condicion')
  const condition = (
    matchState?.condition ||
    matchState?.condicion ||
    "neutro"
  ).toLowerCase();

  // Solo texto del resultado, ordenado según la condición
  let message;
  if (condition === "visitante") {
    // Rival (local) primero, activeClub (visitante) segundo
    message = `${rivalName} ${rivalGoals} - ${ownGoals} ${pretty(activeClub)}`;
  } else {
    // Local o neutro: activeClub primero
    message = `${pretty(activeClub)} ${ownGoals} - ${rivalGoals} ${rivalName}`;
  }

  // Confirm minimal
  Notiflix.Confirm.show(
    "Confirmar Resultado",
    message,
    "Confirmar",
    "Volver",
    async () => {
      try {
        Notiflix.Loading.standard("Guardando partido... ⚽");
        await saveMatch({ uid, matchState, activeClub });
        Notiflix.Notify.success("Partido guardado correctamente ✅");
        matchDispatch({ type: "RESET_FORM" });
        navigate("/versus");
      } catch (e) {
        Notiflix.Notify.failure("Error al guardar el partido ❌");
      } finally {
        Notiflix.Loading.remove();
      }
    }
  );
};

export default handleSaveMatch;

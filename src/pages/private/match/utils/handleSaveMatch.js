// cspell: ignore Notiflix notiflix condicion hattrick autogolesFavor
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
  // --- Validación mínima antes de todo (evita errores opacos) ---
  if (!uid) {
    console.error("[handleSaveMatch] uid vacío; no se puede guardar.");
    Notiflix.Notify.failure("No hay usuario autenticado (uid vacío).");
    return;
  }
  if (!activeClub) {
    console.warn("[handleSaveMatch] activeClub vacío; bloqueando guardado.");
    Notiflix.Notify.warning("Elegí un club antes de guardar el partido.");
    return;
  }

  // Suma de goles por banderas (x1, doblete=2, triplete/hattrick=3)
  const goalsFromFlags = (g) =>
    (g.gol ? 1 : 0) + (g.doblete ? 2 : 0) + (g.triplete || g.hattrick ? 3 : 0);

  // Goles de cada lado
  const own = (matchState?.goleadoresActiveClub || []).filter(
    (g) => g.activeClub === activeClub
  );
  const rivals = matchState?.goleadoresRivales || [];

  const ownGoalsPlayers = own.reduce((acc, g) => acc + goalsFromFlags(g), 0);
  const ownGoals = ownGoalsPlayers + (matchState?.autogolesFavor || 0);
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

  const diag = {
    uid,
    activeClub,
    condition,
    ownGoals,
    ownGoalsFromOG: matchState?.autogolesFavor || 0,
    rivalGoals,
    ownScorers: own?.length ?? 0,
    rivalScorers: rivals?.length ?? 0,
    rivalName,
  };

  // Confirm minimal
  Notiflix.Confirm.show(
    "Confirmar Resultado",
    message,
    "Confirmar",
    "Volver",
    async () => {
      try {
        Notiflix.Loading.standard("Guardando partido... ⚽");
        await saveMatch({
          uid,
          activeClub,
          matchState,
          ownGoals,
          rivalGoals,
          condition,
          rivalName,
          autogolesFavor: matchState?.autogolesFavor || 0,
        });
        const isEditing = !!matchState?.editingMatchId;
        Notiflix.Notify.success(
          isEditing
            ? "Partido actualizado correctamente ✅"
            : "Partido guardado correctamente ✅"
        );
        matchDispatch({ type: "RESET_FORM" });
        navigate("/campeonatos");
      } catch (e) {
        // --- Diagnóstico detallado del error ---
        const info = {
          name: e?.name,
          code: e?.code,
          message: e?.message,
        };
        console.error("[handleSaveMatch] Error al guardar", {
          ...info,
          stack: e?.stack,
          context: diag,
        });
        Notiflix.Report.failure(
          "Error al guardar",
          [
            info.code ? `Código: ${info.code}` : "",
            info.name ? `Tipo: ${info.name}` : "",
            info.message ? `Mensaje: ${info.message}` : "",
            `Club: ${activeClub} | ${ownGoals}-${rivalGoals} vs ${rivalName}`,
          ]
            .filter(Boolean)
            .join("\n"),
          "Cerrar"
        );
      } finally {
        Notiflix.Loading.remove();
      }
    }
  );
};

export default handleSaveMatch;

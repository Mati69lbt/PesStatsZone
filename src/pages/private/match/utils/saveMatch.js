// cspell: ignore Notiflix firestore notiflix
import Notiflix from "notiflix";
import React from "react";
import { db } from "../../../../configuration/firebase";
import { doc, setDoc } from "firebase/firestore";

const SaveMatch = async ({ uid, matchState, activeClub }) => {
  if (!uid) throw new Error("UID no disponible; no se puede guardar.");

  const { fecha, rival } = matchState || {};

  if (!fecha || !rival) {
    Notiflix.Notify.failure("Error Guardar el Formulario");
    throw new console.Error("Faltan completar campos");
  }
  const id = crypto.randomUUID();
  const matchId = `${activeClub}-${id}`;

  const data = {
    fecha,
    rival,
    club: activeClub,
  };

  const ref = doc(db, "users", uid, "matches", matchId);
  console.log(ref);
  console.log(db);

  await setDoc(ref, data, { merge: true });

  return { id: ref.id, path: ref.path };
};

export default SaveMatch;

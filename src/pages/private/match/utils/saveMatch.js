// cspell: ignore Notiflix firestore notiflix
import Notiflix from "notiflix";
import React from "react";
import { db } from "../../../../configuration/firebase";
import { arrayUnion, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { normalizeName } from "../../../../utils/normalizeName";

const SaveMatch = async ({ uid, matchState, activeClub }) => {
  if (!uid) throw new Error("UID no disponible; no se puede guardar.");

  const { fecha, rival } = matchState || {};

  const year = fecha ? new Date(fecha).getFullYear() : null;
  const name = normalizeName(matchState?.torneoName || "")?.trim();
  const nameLower = name ? name.toLowerCase() : null;
  const display = name && year ? `${name} ${year}` : name || "";

  if (!fecha || !rival) {
    Notiflix.Notify.failure("Error Guardar el Formulario");
    throw new Error("Faltan completar campos")();
  }
  const id = (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now());
  const matchId = activeClub ? `${activeClub}-${id}` : id;

  const data = {
    fecha,
    rival,
    club: activeClub,
    torneoName: name,
    torneoYear: year,
    torneoDisplay: display,
    createdAt: serverTimestamp(),
  };

  const ref = doc(db, "users", uid, "matches", matchId);
  await setDoc(ref, data, { merge: true });
  if (nameLower) {
    await setDoc(
      doc(db, "users", uid),
      { torneosIndex: arrayUnion(nameLower) },
      { merge: true }
    );
  }

  return { id: ref.id, path: ref.path };
};

export default SaveMatch;

// cspell: ignore Notiflix firestore notiflix
import React from "react";
import Notiflix from "notiflix";
import { db } from "../../../../configuration/firebase";
import {
  arrayUnion,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { normalizeName } from "../../../../utils/normalizeName";

const saveMatch = async ({ uid, matchState, activeClub }) => {
  if (!uid) throw new Error("UID no disponible; no se puede guardar.");

  const { fecha, rival, captain, starters, substitutes, condition } =
    matchState || {};
  const year = fecha ? new Date(fecha).getFullYear() : null;
  const name = matchState?.torneoName?.trim() || "";
  const display = name && year ? `${name} ${year}` : name || "";

  if (!fecha || !rival) {
    throw new Error("Faltan completar campos");
  }

  const id = (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now());
  const rivalName = matchState?.rival?.trim() || "";

  const match = {
    id,
    fecha,
    captain,
    condition: condition,
    rival: rivalName,
    club: activeClub,
    torneoName: name,
    torneoYear: year,
    torneoDisplay: display,
    createdAt: Date.now(),
    starters: starters,
    substitutes: substitutes,
  };

  // guardamos todo en el doc de usuario
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      matches: arrayUnion(match),
      torneosIndex: arrayUnion(name.toLowerCase()),
      rivalesIndex: rivalName ? arrayUnion(rivalName.toLowerCase()) : [],
    },
    { merge: true }
  );

  const statsRef = doc(db, "users", uid);
  for (const player of starters) {
    const path = `lineups.${activeClub}.playersStats.${player}`;
    await updateDoc(statsRef, {
      [`${path}.matchesPlayed`]: increment(1),
      // [`${path}.goals`]: 0, // se dejan porque después se usarán
      // [`${path}.dobletes`]: 0,
      // [`${path}.hatTricks`]: 0,
      // [`${path}.expulsiones`]: 0,
    });
  }
  for (const player of substitutes) {
    const path = `lineups.${activeClub}.playersStats.${player}`;
    await updateDoc(statsRef, {
      [`${path}.matchesPlayed`]: increment(1),
    });
  }

  return { id };
};

export default saveMatch;

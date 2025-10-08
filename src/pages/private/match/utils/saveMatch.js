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

const saveMatch = async ({
  uid,
  matchState,
  activeClub,
  ownGoals,
  rivalGoals,
  condition,
  rivalName,
}) => {
  if (!uid) throw new Error("UID no disponible; no se puede guardar.");

  if (!activeClub) throw new Error("saveMatch: activeClub vacío");
  if (!Number.isFinite(ownGoals) || !Number.isFinite(rivalGoals)) {
    throw new Error("saveMatch: ownGoals/rivalGoals inválidos");
  }

  const {
    fecha,
    captain,
    starters,
    substitutes,
    goleadoresActiveClub,
    goleadoresRivales,
  } = matchState || {};
  const year = fecha ? new Date(fecha).getFullYear() : null;
  const name = matchState?.torneoName?.trim() || "";
  const display = name && year ? `${name} ${year}` : name || "";

  if (!fecha || !rivalName) {
    throw new Error("Faltan completar campos");
  }

  const id = (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now());

  const outcome =
    ownGoals > rivalGoals
      ? "ganado"
      : ownGoals < rivalGoals
      ? "perdido"
      : "empatado";

  const points = outcome === "ganado" ? 3 : outcome === "empatado" ? 1 : 0;
  const gf = ownGoals;
  const gc = rivalGoals;
  const dfg = gf - gc;

  const resultMatch =
    condition === "visitante"
      ? `${rivalName} ${gc} - ${gf} ${activeClub}`
      : `${activeClub} ${gf} - ${gc} ${rivalName}`;

  const match = {
    id,
    fecha,
    captain,
    condition,
    rival: rivalName,
    club: activeClub,
    torneoName: name,
    torneoYear: year,
    torneoDisplay: display,
    createdAt: Date.now(),
    starters: starters,
    substitutes: substitutes,
    goleadoresActiveClub: goleadoresActiveClub || [],
    goleadoresRivales: goleadoresRivales || [],
    final: outcome,
    points: points,
    golFavor: gf,
    golContra: gc,
    dfGol: dfg,
    resultMatch: resultMatch,
  };

  // guardamos todo en el doc de usuario
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      torneosIndex: arrayUnion(name.toLowerCase()),
      rivalesIndex: rivalName ? arrayUnion(rivalName.toLowerCase()) : [],
    },
    { merge: true }
  );

  const clubKey = normalizeName ? normalizeName(activeClub) : activeClub;
  await updateDoc(userRef, {
    [`lineups.${clubKey}.matches`]: arrayUnion(match),
  });

  const statsRef = doc(db, "users", uid);
  // 🔹 Loop para goleadores
  for (const g of matchState.goleadoresActiveClub || []) {
    const path = `lineups.${activeClub}.playersStats.${g.name}`;
    const updates = {};
    updates[`${path}.matchesPlayed`] = increment(1);

    const goles = (g.gol ? 1 : 0) + (g.doblete ? 2 : 0) + (g.triplete ? 3 : 0);

    if (goles > 0) {
      updates[`${path}.goals`] = increment(goles);
    }
    if (g.doblete) {
      updates[`${path}.dobletes`] = increment(1);
    }
    if (g.triplete) {
      updates[`${path}.hatTricks`] = increment(1);
    }
    if (g.expulsion) {
      updates[`${path}.expulsiones`] = increment(1);
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(statsRef, updates);
    }
  }

  for (const g of matchState.goleadoresRivales || []) {
    const path = `lineups.${activeClub}.rivalsPlayers.${g.name}`;
    const updates = {};
    updates[`${path}.matchesPlayed`] = increment(1);

    const goles = (g.gol ? 1 : 0) + (g.doblete ? 2 : 0) + (g.triplete ? 3 : 0);

    if (goles > 0) {
      updates[`${path}.goals`] = increment(goles);
    }
    if (g.doblete) {
      updates[`${path}.dobletes`] = increment(1);
    }
    if (g.triplete) {
      updates[`${path}.hatTricks`] = increment(1);
    }
    if (g.expulsion) {
      updates[`${path}.expulsiones`] = increment(1);
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(statsRef, updates);
    }
  }

  return { id };
};

export default saveMatch;

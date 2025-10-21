// cspell: ignore Notiflix firestore notiflix autogolesFavor
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
  autogolesFavor = 0,
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
    autogolesFavor,
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
  const isOwnGoalItem = (g) => g?.isOwnGoal || g?.name === "__OG__";
  // 🔹 Loop para goleadores
  for (const g of matchState.goleadoresActiveClub || []) {
    if (isOwnGoalItem(g)) continue;
    const player = normalizeName(g.name || "");
    if (!player) continue;
    const path = `lineups.${clubKey}.playersStats.${player}`;
    const updates = {};
   

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
    if (isOwnGoalItem(g)) continue;
    const player = normalizeName(g.name || "");
    if (!player) continue;
    const path = `lineups.${clubKey}.rivalsPlayers.${player}`;
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

  const torneoKey = (() => {
    const norm = (s) =>
      (s || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    const nk = norm(name);
    const yk = (year ?? "").toString().trim() || "s_a";
    return `${nk}_${yk}`; // p.ej. "copa_de_la_liga_2025"
  })();

  const startersSet = new Set(
    (starters || []).map((s) => normalizeName(s)).filter(Boolean)
  );
  if (captain) startersSet.add(normalizeName(captain));
  const subsSet = new Set(
    (substitutes || [])
      .map((s) => normalizeName(s))
      .filter((p) => p && !startersSet.has(p))
  );
  const appearancesUpdates = {};
  const touchPlayer = (playerKey, { start = 0, sub = 0 }) => {
    if (!playerKey) return;
    const base = `lineups.${clubKey}.playersStats.${playerKey}`;
    const total = `${base}.totals`;
    const byT = `${base}.byTournament.${torneoKey}`;

    // Todo el que juega (titular o suplente) suma partido
    appearancesUpdates[`${total}.matchesPlayed`] = increment(1);
    appearancesUpdates[`${byT}.matchesPlayed`] = increment(1);

    if (start) {
      appearancesUpdates[`${total}.starts`] = increment(1);
      appearancesUpdates[`${byT}.starts`] = increment(1);
    }
    if (sub) {
      appearancesUpdates[`${total}.subs`] = increment(1);
      appearancesUpdates[`${byT}.subs`] = increment(1);
    }
  };

  startersSet.forEach((p) => touchPlayer(p, { start: 1 }));
  subsSet.forEach((p) => touchPlayer(p, { sub: 1 }));

  if (Object.keys(appearancesUpdates).length > 0) {
    appearancesUpdates[`lineups.${clubKey}.updatedAt`] = serverTimestamp();
    await updateDoc(userRef, appearancesUpdates);
    console.log("[STATS] Apariciones OK", {
      starters: startersSet.size,
      subs: subsSet.size,
      torneoKey,
    });
  } else {
    console.log("[STATS] sin apariciones que sumar");
  }

  return { id };
};

export default saveMatch;

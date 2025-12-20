// saveMatch.js
// cspell: ignore Notiflix firestore notiflix autogolesFavor
import React from "react";
import Notiflix from "notiflix";
import { db } from "../../../../configuration/firebase";
import {
  arrayUnion,
  doc,
  getDoc,
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
    editingMatchId,
    editingCreatedAt,
  } = matchState || {};

  const year = fecha ? new Date(fecha).getFullYear() : null;
  const name = matchState?.torneoName?.trim() || "";
  const display = name && year ? `${name} ${year}` : name || "";

  const cleanText = (s) => (s ?? "").toString().trim().replace(/\s+/g, " ");

  const rivalClean = cleanText(rivalName);
  const torneoNameClean = cleanText(name);

  if (!fecha || !rivalClean) {
    throw new Error("Faltan completar campos");
  }

  const isEditing = !!editingMatchId;

  // ✅ Si edito, mantengo el mismo id. Si no, creo uno nuevo.
  const id =
    (isEditing && editingMatchId) ||
    (crypto?.randomUUID && crypto.randomUUID()) ||
    String(Date.now());

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
      ? `${rivalClean} ${gc} - ${gf} ${activeClub}`
      : `${activeClub} ${gf} - ${gc} ${rivalClean}`;

  const match = {
    id,
    fecha,
    captain,
    condition,
    rival: rivalClean,
    club: activeClub,
    torneoName: name,
    torneoYear: year,
    torneoDisplay: display,

    // ✅ en edición, NO piso createdAt
    createdAt: isEditing ? editingCreatedAt ?? Date.now() : Date.now(),
    updatedAt: Date.now(),

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

  const userRef = doc(db, "users", uid);

  // índices (no rompen nada si se repiten)
  await setDoc(
    userRef,
    {
      torneosIndex: arrayUnion(name.toLowerCase()),
      rivalesIndex: rivalClean ? arrayUnion(rivalClean.toLowerCase()) : [],
    },
    { merge: true }
  );

  const clubKey = normalizeName ? normalizeName(activeClub) : activeClub;

  // ------------------------------------------------------------------
  // 1) GUARDAR MATCH: si edito -> reemplazo en el array; si no -> arrayUnion
  // ------------------------------------------------------------------
  let oldMatch = null;

  if (isEditing) {
    const snap = await getDoc(userRef);
    const data = snap.data() || {};
    const currentMatches =
      data?.lineups?.[clubKey]?.matches &&
      Array.isArray(data.lineups[clubKey].matches)
        ? data.lineups[clubKey].matches
        : [];

    oldMatch = currentMatches.find((m) => m?.id === id) || null;

    const nextMatches = oldMatch
      ? currentMatches.map((m) => (m?.id === id ? match : m))
      : [...currentMatches, match]; // fallback: si no lo encontró, lo agrega

    await updateDoc(userRef, {
      [`lineups.${clubKey}.matches`]: nextMatches,
    });
  } else {
    await updateDoc(userRef, {
      [`lineups.${clubKey}.matches`]: arrayUnion(match),
    });
  }

  // ------------------------------------------------------------------
  // 2) STATS: si NO edito -> tu lógica actual (suma). Si edito -> DELTAS.
  // ------------------------------------------------------------------
  const isOwnGoalItem = (g) => g?.isOwnGoal || g?.name === "__OG__";

  const goalsFromFlags = (g) =>
    (g?.gol ? 1 : 0) +
    (g?.doblete ? 2 : 0) +
    (g?.triplete || g?.hattrick ? 3 : 0);

  const makeTorneoKey = (torneoName, torneoYear) => {
    const norm = (s) =>
      (s || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    const nk = norm(torneoName);
    const yk = (torneoYear ?? "").toString().trim() || "s_a";
    return `${nk}_${yk}`;
  };

  // ---------------------------
  // A) NO edición: igual que hoy
  // ---------------------------
  if (!isEditing) {
    // goleadores propios
    for (const g of matchState.goleadoresActiveClub || []) {
      if (isOwnGoalItem(g)) continue;
      const player = normalizeName(g.name || "");
      if (!player) continue;

      const path = `lineups.${clubKey}.playersStats.${player}`;
      const updates = {};

      const goles = goalsFromFlags(g);
      if (goles > 0) updates[`${path}.goals`] = increment(goles);
      if (g.doblete) updates[`${path}.dobletes`] = increment(1);
      if (g.triplete || g.hattrick) updates[`${path}.hatTricks`] = increment(1);
      if (g.expulsion) updates[`${path}.expulsiones`] = increment(1);

      if (Object.keys(updates).length > 0) await updateDoc(userRef, updates);
    }

    // goleadores rivales
    for (const g of matchState.goleadoresRivales || []) {
      if (isOwnGoalItem(g)) continue;
      const player = normalizeName(g.name || "");
      if (!player) continue;

      const path = `lineups.${clubKey}.rivalsPlayers.${player}`;
      const updates = {};
      updates[`${path}.matchesPlayed`] = increment(1);

      const goles = goalsFromFlags(g);
      if (goles > 0) updates[`${path}.goals`] = increment(goles);
      if (g.doblete) updates[`${path}.dobletes`] = increment(1);
      if (g.triplete || g.hattrick) updates[`${path}.hatTricks`] = increment(1);
      if (g.expulsion) updates[`${path}.expulsiones`] = increment(1);

      if (Object.keys(updates).length > 0) await updateDoc(userRef, updates);
    }

    // apariciones
    const torneoKey = makeTorneoKey(name, year);

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
    }

    return { id };
  }

  // -----------------------------------------
  // B) EDICIÓN: aplicar DELTAS (old vs new)
  // -----------------------------------------
  if (!oldMatch) {
    // Si por algún motivo no encontramos el oldMatch, ya guardamos el reemplazo arriba.
    // Para no romper nada, evitamos tocar stats en falso.
    return { id };
  }

  const statsUpdates = {};

  // helper: acumula increments solo si delta != 0
  const incIf = (path, delta) => {
    if (!delta || delta === 0) return;
    statsUpdates[path] = increment(delta);
  };

  const collectCounters = (arr) => {
    const map = new Map();
    for (const g of arr || []) {
      if (isOwnGoalItem(g)) continue;
      const player = normalizeName(g?.name || "");
      if (!player) continue;

      const prev = map.get(player) || {
        goals: 0,
        dobletes: 0,
        hatTricks: 0,
        expulsiones: 0,
        matchesPlayed: 0,
      };

      const goles = goalsFromFlags(g);
      prev.goals += goles;
      if (g?.doblete) prev.dobletes += 1;
      if (g?.triplete || g?.hattrick) prev.hatTricks += 1;
      if (g?.expulsion) prev.expulsiones += 1;

      map.set(player, prev);
    }
    return map;
  };

  // 1) DELTA goleadores propios
  {
    const oldMap = collectCounters(oldMatch.goleadoresActiveClub || []);
    const newMap = collectCounters(matchState.goleadoresActiveClub || []);
    const players = new Set([...oldMap.keys(), ...newMap.keys()]);

    for (const p of players) {
      const o = oldMap.get(p) || {
        goals: 0,
        dobletes: 0,
        hatTricks: 0,
        expulsiones: 0,
      };
      const n = newMap.get(p) || {
        goals: 0,
        dobletes: 0,
        hatTricks: 0,
        expulsiones: 0,
      };

      const base = `lineups.${clubKey}.playersStats.${p}`;
      incIf(`${base}.goals`, n.goals - o.goals);
      incIf(`${base}.dobletes`, n.dobletes - o.dobletes);
      incIf(`${base}.hatTricks`, n.hatTricks - o.hatTricks);
      incIf(`${base}.expulsiones`, n.expulsiones - o.expulsiones);
    }
  }

  // 2) DELTA goleadores rivales (incluye el matchesPlayed “por item”, como lo venías usando)
  {
    const oldMap = collectCounters(oldMatch.goleadoresRivales || []);
    const newMap = collectCounters(matchState.goleadoresRivales || []);
    const players = new Set([...oldMap.keys(), ...newMap.keys()]);

    const countItems = (arr) => {
      const m = new Map();
      for (const g of arr || []) {
        if (isOwnGoalItem(g)) continue;
        const player = normalizeName(g?.name || "");
        if (!player) continue;
        m.set(player, (m.get(player) || 0) + 1);
      }
      return m;
    };

    const oldItems = countItems(oldMatch.goleadoresRivales || []);
    const newItems = countItems(matchState.goleadoresRivales || []);

    for (const p of players) {
      const o = oldMap.get(p) || {
        goals: 0,
        dobletes: 0,
        hatTricks: 0,
        expulsiones: 0,
      };
      const n = newMap.get(p) || {
        goals: 0,
        dobletes: 0,
        hatTricks: 0,
        expulsiones: 0,
      };

      const base = `lineups.${clubKey}.rivalsPlayers.${p}`;
      incIf(
        `${base}.matchesPlayed`,
        (newItems.get(p) || 0) - (oldItems.get(p) || 0)
      );
      incIf(`${base}.goals`, n.goals - o.goals);
      incIf(`${base}.dobletes`, n.dobletes - o.dobletes);
      incIf(`${base}.hatTricks`, n.hatTricks - o.hatTricks);
      incIf(`${base}.expulsiones`, n.expulsiones - o.expulsiones);
    }
  }

  // 3) DELTA apariciones (totals + byTournament)
  {
    const collectAppearance = (m) => {
      const cap = normalizeName(m?.captain || "");
      const startersSet = new Set(
        (m?.starters || []).map((s) => normalizeName(s)).filter(Boolean)
      );
      if (cap) startersSet.add(cap);

      const subsSet = new Set(
        (m?.substitutes || [])
          .map((s) => normalizeName(s))
          .filter((p) => p && !startersSet.has(p))
      );

      const map = new Map();
      startersSet.forEach((p) => map.set(p, { start: 1, sub: 0 }));
      subsSet.forEach((p) => map.set(p, { start: 0, sub: 1 }));
      return map;
    };

    const oldApp = collectAppearance(oldMatch);
    const newApp = collectAppearance(matchState);

    const oldTKey = makeTorneoKey(oldMatch.torneoName, oldMatch.torneoYear);
    const newTKey = makeTorneoKey(name, year);

    const players = new Set([...oldApp.keys(), ...newApp.keys()]);

    for (const p of players) {
      const o = oldApp.get(p) || { start: 0, sub: 0 };
      const n = newApp.get(p) || { start: 0, sub: 0 };

      const oldInvol = o.start || o.sub ? 1 : 0;
      const newInvol = n.start || n.sub ? 1 : 0;

      const base = `lineups.${clubKey}.playersStats.${p}`;
      const total = `${base}.totals`;

      // totals: solo cambia si pasa de jugar a no jugar, o viceversa (raro pero posible)
      incIf(`${total}.matchesPlayed`, newInvol - oldInvol);
      incIf(`${total}.starts`, n.start - o.start);
      incIf(`${total}.subs`, n.sub - o.sub);

      // byTournament: si cambia la key, saco del viejo y pongo en el nuevo
      if (oldTKey === newTKey) {
        const byT = `${base}.byTournament.${newTKey}`;
        incIf(`${byT}.matchesPlayed`, newInvol - oldInvol);
        incIf(`${byT}.starts`, n.start - o.start);
        incIf(`${byT}.subs`, n.sub - o.sub);
      } else {
        // quitar del torneo viejo
        if (oldInvol) {
          const byOld = `${base}.byTournament.${oldTKey}`;
          incIf(`${byOld}.matchesPlayed`, -1);
          if (o.start) incIf(`${byOld}.starts`, -1);
          if (o.sub) incIf(`${byOld}.subs`, -1);
        }
        // agregar al torneo nuevo
        if (newInvol) {
          const byNew = `${base}.byTournament.${newTKey}`;
          incIf(`${byNew}.matchesPlayed`, +1);
          if (n.start) incIf(`${byNew}.starts`, +1);
          if (n.sub) incIf(`${byNew}.subs`, +1);
        }
      }
    }
  }

  if (Object.keys(statsUpdates).length > 0) {
    statsUpdates[`lineups.${clubKey}.updatedAt`] = serverTimestamp();
    await updateDoc(userRef, statsUpdates);
  }

  return { id };
};

export default saveMatch;

//cspell: ignore Notiflix notiflix
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { pretty } from "../../match/utils/pretty";
import {
  SAVE_CLUB_NAME,
  LINEUPS_UPSERT_BUCKET,
  CLUB_LOAD_FROM_ACTIVE,
} from "../../../../context/LineUpProvider";
import { db } from "../../../../configuration/firebase";

export async function saveActiveOnBlur({ uid, teamName, dispatch }) {
  const clubKey = normalizeName(teamName);
  if (!uid || !clubKey) return;

  // fijar activo local (clave normalizada)
  dispatch({ type: SAVE_CLUB_NAME, payload: { name: clubKey } });

  try {
    await setDoc(
      doc(db, "users", uid),
      { activeClub: clubKey },
      { merge: true }
    );
  } catch (e) {
    console.error(e);
    Notiflix.Notify.failure("No se pudo fijar el club activo");
  }
}

export async function confirmClubSave({
  uid,
  teamName,
  lineups, // estado actual por si ya existe el bucket
  dispatch,
}) {
  const raw = String(teamName || "").trim();
  if (!raw) return Notiflix.Notify.failure("¿Qué equipo dirigís?");
  if (!uid) return Notiflix.Notify.failure("No hay sesión.");

  const clubKey = normalizeName(raw);
  const label = pretty(raw);

  // setear activo en estado (clave normalizada)
  dispatch({ type: SAVE_CLUB_NAME, payload: { name: clubKey } });

  try {
    // crear/merge en Firestore con estructura mínima
    await setDoc(
      doc(db, "users", uid),
      {
        managedClubs: arrayUnion(clubKey),
        activeClub: clubKey,
        lineups: {
          [clubKey]: {
            label,
            players: lineups?.[clubKey]?.players ?? [],
            formations: lineups?.[clubKey]?.formations ?? [],
            playersStats: lineups?.[clubKey]?.playersStats ?? {},
            rivalsPlayers: lineups?.[clubKey]?.rivalsPlayers ?? {},
            matches: lineups?.[clubKey]?.matches ?? [],
            updatedAt: serverTimestamp(),
          },
        },
      },
      { merge: true }
    );

    // opcional: refrescar del servidor para traer formations ordenadas
    const snap = await getDoc(doc(db, "users", uid));
    const data = snap.exists() ? snap.data() : null;
    const remoteClub = data?.lineups?.[clubKey];

    if (remoteClub) {
      const formations = remoteClub?.formations
        ? Object.entries(remoteClub.formations)
            .map(([id, f]) => ({ id, ...f }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      dispatch({
        type: LINEUPS_UPSERT_BUCKET,
        payload: {
          club: clubKey,
          bucket: {
            label: remoteClub.label ?? label,
            players: remoteClub.players ?? [],
            formations,
            playersStats: remoteClub.playersStats ?? {},
            rivalsPlayers: remoteClub.rivalsPlayers ?? {},
            matches: remoteClub.matches ?? [],
          },
        },
      });
    }

    // cargar bucket al plano
    dispatch({ type: CLUB_LOAD_FROM_ACTIVE });

    Notiflix.Notify.success("Club guardado/activado");
  } catch (e) {
    console.error(e);
    Notiflix.Notify.failure("No se pudo guardar el club en la nube");
  }
}

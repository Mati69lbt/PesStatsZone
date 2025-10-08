// cspell: ignore Notiflix notiflix probá Firestore Normalizá firestore
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { CLUB_LOAD_FROM_ACTIVE, LINEUPS_UPSERT_BUCKET, SAVE_CLUB_NAME } from "../../../../context/LineUpProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../configuration/firebase";

const loadClubOnBlur = async ({ uid, teamName, lineups, dispatch }) => {
  const raw = (teamName || "").trim();
  if (!raw) return;
  const clubKey = normalizeName(raw);
  if (!clubKey) return;

  // 1) ¿Existe en estado local?
  const localBucket = lineups?.[clubKey];
  if (localBucket) {
    dispatch({ type: SAVE_CLUB_NAME, payload: { name: clubKey } });
    dispatch({ type: CLUB_LOAD_FROM_ACTIVE }); // ← trae players del bucket activo
    Notiflix.Notify.success("Equipo cargado desde memoria local");
    return;
  }

  // 2) Si no está localmente, probá en Firestore
  if (!uid) {
    Notiflix.Notify.info("No hay sesión para buscar en la nube");
    return;
  }

  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      Notiflix.Notify.info("No se encontraron datos guardados de ese club");
      return;
    }
    const data = snap.data();
    const remoteBucket = data?.lineups?.[clubKey];
    if (!remoteBucket) {
      Notiflix.Notify.info("No se encontraron datos guardados de ese club");
      return;
    }

    // Normalizá formaciones a array ordenada si vienen como objeto
    const formations = remoteBucket.formations
      ? Object.entries(remoteBucket.formations)
          .map(([id, f]) => ({ id, ...f }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];

    // Upsert del bucket al estado
    dispatch({
      type: LINEUPS_UPSERT_BUCKET,
      payload: {
        club: clubKey,
        bucket: {
          label: remoteBucket.label ?? raw,
          players: remoteBucket.players ?? [],
          formations,
          playersStats: remoteBucket.playersStats ?? {},
          rivalsPlayers: remoteBucket.rivalsPlayers ?? {},
          matches: remoteBucket.matches ?? [],
        },
      },
    });

    // Activar y cargar jugadores del bucket
    dispatch({ type: SAVE_CLUB_NAME, payload: { name: clubKey } });
    dispatch({ type: CLUB_LOAD_FROM_ACTIVE });

    Notiflix.Notify.success("Equipo cargado desde la nube");
  } catch (e) {
    console.error(e);
    Notiflix.Notify.failure("No se pudo recuperar el equipo de la nube");
  }
};

export default loadClubOnBlur;

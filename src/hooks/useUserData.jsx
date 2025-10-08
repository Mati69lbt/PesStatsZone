// cspell: ignore Notiflix firestore notiflix
import { doc, getDoc } from "firebase/firestore";
import Notiflix from "notiflix";
import React, { useEffect } from "react";
import { db } from "../configuration/firebase";
import { normalizeName } from "../utils/normalizeName";

export const fetchUserData = async (uid, matchDispatch) => {
  if (!uid) return;

  try {
    Notiflix.Loading.standard("Cargando datos...");

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log("[Partido] datos usuario:", data);

      // Guardar en el reducer de partido
      const {
        activeClub: _ignore, // ⬅️ NO hidratar activeClub aquí
        lineups,
        torneosIndex,
        rivalesIndex,
      } = data || {};
      matchDispatch({
        type: "HYDRATE_FROM_FIREBASE",
        payload: { lineups, torneosIndex, rivalesIndex },
      });

      const clubKey = normalizeName(data?.activeClub);
      const dataMatches = data?.lineups?.[clubKey]?.matches || [];
      const lastDate = dataMatches
        .map((m) => m?.fecha)
        .filter(Boolean)
        .sort((a, b) => new Date(a) - new Date(b)) // asc
        .at(-1);
      if (lastDate) {
        Notiflix.Notify.success("Info Sincronizado");
        matchDispatch({
          type: "ACTUALIZAR_CAMPO",
          campo: "fecha",
          valor: lastDate,
        });
      }
    } else {
      console.warn("[Partido] no existe doc para uid:", uid);
    }
  } catch (error) {
    console.error("Error al montar el formulario", error);
    Notiflix.Notify.failure("Error al cargar el formulario");
  } finally {
    Notiflix.Loading.remove();
  }
};

export const useUserData = (uid, matchDispatch) => {
  useEffect(() => {
    fetchUserData(uid, matchDispatch);
  }, [uid]);
};

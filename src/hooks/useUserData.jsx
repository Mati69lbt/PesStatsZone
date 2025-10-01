// cspell: ignore Notiflix firestore notiflix
import { doc, getDoc } from "firebase/firestore";
import Notiflix from "notiflix";
import React, { useEffect } from "react";
import { db } from "../configuration/firebase";

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
      matchDispatch({
        type: "HYDRATE_FROM_FIREBASE",
        payload: data || {},
      });
      if (data.matches && data.matches.length > 0) {
        const lastDate = data.matches[data.matches.length - 1].fecha;
        if (lastDate) {
          matchDispatch({
            type: "ACTUALIZAR_CAMPO",
            campo: "fecha",
            valor: lastDate,
          });
        }
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

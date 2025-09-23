// cspell: ignore Notiflix firestore notiflix
import { doc, getDoc } from "firebase/firestore";
import Notiflix from "notiflix";
import React, { useEffect } from "react";
import { db } from "../configuration/firebase";

const useUserData = (uid, matchDispatch) => {
  useEffect(() => {
    if (!uid) return;

    (async () => {
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
        } else {
          console.warn("[Partido] no existe doc para uid:", uid);
        }
      } catch (error) {
        console.error("Error al montar el formulario", error);
        Notiflix.Notify.failure("Error al cargar el formulario");
      } finally {
        Notiflix.Loading.remove();
      }
    })();
  }, [uid]);
};

export default useUserData;

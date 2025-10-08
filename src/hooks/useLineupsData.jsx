// cspell: ignore Notiflix notiflix firestore
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Notiflix from "notiflix";
import { db } from "../configuration/firebase";
import { normalizeName } from "../utils/normalizeName";

export function useLineupsData(uid, dispatch) {
  const hydratingRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!uid) {
      setHydrated(true);
      return;
    }
    if (hydratingRef.current) return; // evita loaders duplicados

    (async () => {
      hydratingRef.current = true;
      Notiflix.Loading.circle("Cargando datos del club...");

      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return;

        const data = snap.data();
        const remoteLineups = data?.lineups || {};

        for (const [clubKey, clubBucket] of Object.entries(remoteLineups)) {
          const players = Array.isArray(clubBucket.players)
            ? clubBucket.players.map(normalizeName)
            : [];

          const formations = clubBucket.formations
            ? Object.entries(clubBucket.formations)
                .map(([id, f]) => {
                  const createdAt =
                    f?.createdAt && typeof f.createdAt?.toDate === "function"
                      ? f.createdAt.toDate().toISOString()
                      : String(f?.createdAt || new Date().toISOString());

                  return {
                    id,
                    createdAt,
                    captain: normalizeName(f?.captain || ""),
                    starters: Array.isArray(f?.starters)
                      ? f.starters.map(normalizeName)
                      : [],
                  };
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [];

          dispatch({
            type: "LINEUPS_UPSERT_BUCKET",
            payload: {
              club: normalizeName(clubKey),
              bucket: {
                label: clubBucket.label ?? clubKey,
                players,
                formations,
              },
            },
          });
        }
      } catch (e) {
        Notiflix.Notify.failure(
          "Problemas al cargar la información de la nube"
        );
      } finally {
        Notiflix.Loading.remove();
        hydratingRef.current = false;
        setHydrated(true);
      }
    })();
  }, [uid, dispatch]);
  return hydrated;
}

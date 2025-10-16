// cspell: ignore Notiflix notiflix firestore Millis
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Notiflix from "notiflix";
import { db } from "../configuration/firebase";
import { normalizeName } from "../utils/normalizeName";

export function useLineupsData(uid, dispatch, currentActive = "") {
  const hydratingRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  const toMillis = (ts) => {
    if (ts && typeof ts.toMillis === "function") return ts.toMillis();
    const n = new Date(ts).getTime();
    return Number.isFinite(n) ? n : 0;
  };

  useEffect(() => {
    if (!uid) {
      setHydrated(true);
      return;
    }
    if (hydratingRef.current) return;

    (async () => {
      hydratingRef.current = true;
      Notiflix.Loading.circle("Cargando datos del club...");

      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return;

        const data = snap.data();
        const remoteLineups = data?.lineups || {};

        const keysInLineups = Object.keys(remoteLineups).map(normalizeName);

        const fromDb = Array.isArray(data?.managedClubs)
          ? data.managedClubs
              .map(normalizeName)
              .filter((k) => keysInLineups.includes(k))
          : [];

        const byUpdatedDesc = keysInLineups
          .map((k) => [k, toMillis(remoteLineups[k]?.updatedAt)])
          .sort((a, b) => b[1] - a[1])
          .map(([k]) => k);

        // (C) hidratar managedClubs al estado (DB primero y dedupe con keys existentes)
        const mergedManaged = [
          ...fromDb,
          ...byUpdatedDesc.filter((k) => !fromDb.includes(k)),
        ];
        dispatch({
          type: "SET_MANAGED_CLUBS",
          payload: { clubs: mergedManaged },
        });

        let bestClubByUpdated = "";
        let bestMs = 0;
        const normalizedKeys = [];

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
          const key = normalizeName(clubKey);
          normalizedKeys.push(key);

          // pick por updatedAt (si está grabado en el bucket)
          const ms = toMillis(clubBucket?.updatedAt);
          if (ms > bestMs) {
            bestMs = ms;
            bestClubByUpdated = key;
          }

          dispatch({
            type: "LINEUPS_UPSERT_BUCKET",
            payload: {
              club: key,
              bucket: {
                label: clubBucket.label ?? clubKey,
                players,
                formations,
              },
            },
          });
        }
        let chosen = "";
        const dbActive = data?.activeClub ? normalizeName(data.activeClub) : "";
        if (dbActive && normalizedKeys.includes(dbActive)) {
          chosen = dbActive;
        } else if (fromDb.length) {
          for (let i = fromDb.length - 1; i >= 0; i--) {
            const k = fromDb[i];
            if (normalizedKeys.includes(k)) {
              chosen = k;
              break;
            }
          }
        }
        if (!chosen) chosen = bestClubByUpdated || "";      
        if (chosen && chosen !== currentActive) {
          dispatch({ type: "SAVE_CLUB_NAME", payload: { name: chosen } });
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

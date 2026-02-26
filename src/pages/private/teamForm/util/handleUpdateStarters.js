// cspell: ignore Notiflix notiflix firestore Debés Guardá
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { LINEUP_SAVE_LOCAL } from "../../../../context/LineUpProvider";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../../configuration/firebase";



const handleUpdateStarters = async ({
  formationId, 
  starters,
  captainName,
  activeClub,
  teamName,
  players,
  uid,
  dispatch,
  setShowForm,
  createdAt
}) => {
  if (!formationId) {
    Notiflix.Notify.failure("No hay formación seleccionada para actualizar.");
    return false;
  }

  if (!Array.isArray(starters) || starters.length !== 11) {
    Notiflix.Notify.failure("Debés elegir exactamente 11 titulares.");
    return false;
  }

  if (!captainName) {
    Notiflix.Notify.failure("Elegí un capitán.");
    return false;
  }

  if (!starters.includes(captainName)) {
    Notiflix.Notify.failure("El capitán debe estar entre los 11 titulares.");
    return false;
  }

  if (!activeClub && !teamName) {
    Notiflix.Notify.failure(
      "Guardá el nombre del equipo antes de actualizar la formación.",
    );
    return false;
  }

  if (!uid) {
    Notiflix.Notify.failure("No hay sesión.");
    return false;
  }

  const clubKey = normalizeName(activeClub || teamName);
  if (!clubKey) {
    Notiflix.Notify.failure("Falta el nombre del equipo.");
    return false;
  }

  const captain = captainName;
  const startersPayload = [...starters];

  // ✅ Reducer local (reutilizo la misma action para upsert local por id)
  // Nota: si tu reducer pisa createdAt cuando no viene, pasale createdAt desde el original.
  dispatch?.({
    type: LINEUP_SAVE_LOCAL,
    payload: {
      id: formationId,
      name: teamName,
      captain: captainName,
      starters: startersPayload,
      ...(createdAt ? { createdAt } : {}), // no lo piso si no lo mandás
      players: [...players],
    },
  });

  // ✅ Persistencia Firestore SIN pisar createdAt (actualizo fields puntuales)
  try {
    await updateDoc(doc(db, "users", uid), {
      [`lineups.${clubKey}.formations.${formationId}.captain`]: captain,
      [`lineups.${clubKey}.formations.${formationId}.starters`]:
        startersPayload,
      [`lineups.${clubKey}.formations.${formationId}.updatedAt`]:
        serverTimestamp(),

      // mantengo tu lógica de players normalizados
      [`lineups.${clubKey}.players`]: [...new Set(players.map(normalizeName))],
      [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
    });

    setShowForm?.(false);
    Notiflix.Notify.success("Formación actualizada");
    return true;
  } catch (e) {
    console.error(e);
    Notiflix.Notify.failure("No se pudo actualizar la formación en la nube");
    return false;
  }
};

export default handleUpdateStarters;

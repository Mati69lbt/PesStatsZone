// cspell: ignore Notiflix lenght notiflix firestore Debés Guardá
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { LINEUP_SAVE_LOCAL } from "../../../../context/LineUpProvider";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../../configuration/firebase";

const handleSaveStarters = async ({
  starters = [],
  captainName = "",
  activeClub = "",
  teamName = "",
  players = [],
  uid = "",
  dispatch,
  setShowForm,
}) => {
  if (!Array.isArray(starters) || starters.length !== 11) {
    Notiflix.Notify.failure("Debés elegir exactamente 11 titulares.");
    return false;
  }
  if (!captainName) {
    Notiflix.Notify.failure("Elegí un capitán.");
    return;
  }
  if (!starters.includes(captainName)) {
    Notiflix.Notify.failure("El capitán debe estar entre los 11 titulares.");
    return;
  }
  if (!activeClub && !teamName) {
    Notiflix.Notify.failure(
      "Guardá el nombre del equipo antes de guardar la formación."
    );
    return;
  }
  if (!uid) {
    Notiflix.Notify.failure("No hay sesión.");
    return;
  }

  const id =
    crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

  const clubKey = normalizeName(activeClub || teamName);
  const createdAtISO = new Date().toISOString();
  const captain = captainName;
  const startersPayload = [...starters];

  if (!clubKey) {
    Notiflix.Notify.failure("Falta el nombre del equipo.");
    return;
  }

  // Reducer primero (estado local consistente)
  dispatch({
    type: LINEUP_SAVE_LOCAL,
    payload: {
      id,
      name: teamName,
      captain: captainName,
      starters: startersPayload,
      createdAt: new Date(), // el reducer lo normaliza a ISO
      players: [...players],
    },
  });

  // Persistencia en Firestore
  try {
    await updateDoc(doc(db, "users", uid), {
      [`lineups.${clubKey}.formations.${id}`]: {
        createdAt: createdAtISO,
        captain,
        starters: startersPayload,
      },
      [`lineups.${clubKey}.players`]: [...new Set(players.map(normalizeName))],
      [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
    });

    setShowForm(false);
    Notiflix.Notify.success("Equipo guardado");
  } catch (e) {
    console.error(e);
    Notiflix.Notify.failure("No se pudo guardar la formación en la nube");
  }
};

export default handleSaveStarters;

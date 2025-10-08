// cspell: ignore Notiflix lenght notiflix firestore querés
import Notiflix from "notiflix";
import { normalizeName } from "../../../../utils/normalizeName";
import { LINEUP_DELETE_LOCAL } from "../../../../context/LineUpProvider";
import { db } from "../../../../configuration/firebase";
import { deleteField, doc, serverTimestamp, updateDoc } from "firebase/firestore";


const handleDelete = (lineup, activeClub, teamName, uid, dispatch) => {
  const clubKey = normalizeName(activeClub || teamName);
  if (!uid || !clubKey) return;
  Notiflix.Confirm.show(
    "Confirmar eliminación",
    "¿Seguro que querés eliminar esta formación?",
    "Sí, eliminar",
    "Cancelar",
    async () => {
      dispatch({ type: LINEUP_DELETE_LOCAL, payload: { id: lineup.id } });
      Notiflix.Notify.success("Formación eliminada");

      const clubKey = normalizeName(activeClub || teamName);
      if (!uid || !clubKey) return;
      try {
        await updateDoc(doc(db, "users", uid), {
          [`lineups.${clubKey}.formations.${lineup.id}`]: deleteField(),
          [`lineups.${clubKey}.updatedAt`]: serverTimestamp(),
        });
      } catch (e) {
        console.error(e);
        Notiflix.Notify.failure("No se pudo eliminar en la nube");
      }
    },
    () => {
      // ❌ si cancela → no hagas nada
    }
  );
};

export default handleDelete;

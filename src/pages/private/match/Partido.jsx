// cspell: ignore Notiflix firestore notiflix estadisticas
import React, { useEffect, useState } from "react";
import { usePartido } from "../../../context/PartidoReducer";
import { useLineups } from "../../../context/LineUpProvider";
import useAuth from "../../../hooks/useAuth";
import FechaInput from "./inputs/FechaInput";
import { makeHandleChange } from "./utils/handleChange";
import RivalInput from "./inputs/RivalInput";
import GuardarPartidoButton from "./button/GuardarPartidoButton";
import Notiflix from "notiflix";

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import saveMatch from "./utils/saveMatch";
import { useNavigate } from "react-router-dom";
import { pretty } from "./utils/pretty";
import { db } from "../../../configuration/firebase";

const Partido = () => {
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { uid, isAuthenticated } = useAuth();
  const { state: lineupState } = useLineups();
  const { activeClub, lineups } = lineupState;

  /************* Borrar  **************/
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  const handleChange = makeHandleChange(matchDispatch);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        if (!uid) return;

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        const data = userSnap.data();
        console.log(data);

        setUserData(data);
      } catch (error) {
        console.error("Error al montar el formulario", error);
        Notiflix.Notify.failure("Error montar el Formulario");
      }
    })();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Registrar Partido</h1>
      <form className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <span className="text-lg font-bold text-blue-700">
            {userData?.activeClub
              ? pretty(userData.activeClub)
              : "Esperando Nombre del Club"}
          </span>
        </div>
        <FechaInput value={matchState.fecha} onChange={handleChange} />
        <RivalInput value={matchState.rival} onChange={handleChange} />
        <GuardarPartidoButton
          disabled={!uid || !matchState.fecha || !matchState.rival}
          onClick={async (e) => {
            e.preventDefault();
            try {
              await saveMatch({ uid, matchState, activeClub });
              navigate("/versus");
            } catch (err) {
              Notiflix.Notify.failure("Error Guardar el Formulario");
              console.error("Error al guardar:", err);
            }
          }}
        />
      </form>
    </div>
  );
};

export default Partido;

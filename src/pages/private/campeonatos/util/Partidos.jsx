import { useEffect, useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { usePartido } from "../../../../context/PartidoReducer";
import useAuth from "../../../../hooks/useAuth";
import { fetchUserData, useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import CampDesgl from "./CampDesgl";
import { pretty } from "../../match/utils/pretty";
import Notiflix from "notiflix";
import { useNavigate } from "react-router-dom";

const Partidos = () => {
  const { uid } = useAuth();
  const navigate = useNavigate();
  const { dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  // carga de data (mismo patrón que Campeonatos)
  useUserData(uid, matchDispatch, lineupDispatch);

  const refreshData = async () => {
    if (!uid) return;
    Notiflix.Loading.pulse("Actualizando..."); //
    await fetchUserData(uid, matchDispatch, lineupDispatch);
    Notiflix.Loading.remove(); //
  };

  const clubs = Object.keys(lineupState?.lineups || {});
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || "",
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;
  const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];
  const torneosConfig = bucket?.torneosConfig || {};

  useEffect(() => {
    if (!uid) return;

    // Si aún no hay lineups cargados, mostramos loading
    if (!lineupState || Object.keys(lineupState.lineups || {}).length === 0) {
      Notiflix.Loading.circle("Cargando partidos...", {
        svgColor: "#0ea5e9",
        messageColor: "#0ea5e9",
      });
    } else {
      Notiflix.Loading.remove();

      // Si después de cargar, este club no tiene matches, redirigimos
      if (matches.length === 0) {
        Notiflix.Notify.info("No se encontraron partidos para este club.");
        navigate("/versus");
      }
    }

    return () => {
      Notiflix.Loading.remove();
    };
  }, [uid, lineupState, matches.length, navigate]);

  // Renderizado preventivo mientras redirige o carga
  if (!uid || matches.length === 0) return null;

  return (
    <div className="p-2 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mt-2 mb-2 px-2 border-b border-slate-100 pb-2">
        {/* BLOQUE IZQUIERDO: Selector de Club con aire superior para la etiqueta */}

        {/* BLOQUE DERECHO: Título con jerarquía visual clara */}
        <div className="flex flex-col items-end text-right">
          <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none uppercase">
            Detalle de Partidos
          </h2>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Por Campeonato
            </span>
            <span className="text-xl">📋</span>
          </div>

          {/* Una pequeña línea decorativa para cerrar el bloque del título */}
          <div className="h-1 w-12 bg-sky-500 rounded-full mt-1"></div>
        </div>
        <div className="relative ">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wide text-sky-600 z-10">
            Club
          </label>
          <select
            className="w-full sm:w-max rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 font-semibold text-slate-700 cursor-pointer"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {pretty(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CampDesgl
        matches={matches}
        clubKey={clubKey}
        uid={uid}
        onRefresh={refreshData}
        torneosConfig={torneosConfig}
      />
    </div>
  );
};

export default Partidos;

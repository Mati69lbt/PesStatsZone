import { useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { usePartido } from "../../../../context/PartidoReducer";
import useAuth from "../../../../hooks/useAuth";
import { fetchUserData, useUserData } from "../../../../hooks/useUserData";
import { normalizeName } from "../../../../utils/normalizeName";
import CampDesgl from "./CampDesgl";

const Partidos = () => {
  const { uid } = useAuth();
  const { dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  // carga de data (mismo patrón que Campeonatos)
  useUserData(uid, matchDispatch, lineupDispatch);

  const refreshData = async () => {
    if (!uid) return;
    await fetchUserData(uid, matchDispatch, lineupDispatch);
  };

  const clubs = Object.keys(lineupState?.lineups || {});
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || ""
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;
  const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">📋 Partidos</h1>

      <div className="flex flex-wrap gap-4 mb-4 items-end justify-center">
        <div className="text-center">
          <label className="text-sm font-medium block">Club</label>
          <select
            className="border p-1 rounded text-sm"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="border px-3 py-1 rounded text-sm"
          onClick={refreshData}
        >
          ↻ Refrescar
        </button>
      </div>

      <CampDesgl
        matches={matches}
        clubKey={clubKey}
        uid={uid}
        onRefresh={refreshData}
      />
    </div>
  );
};

export default Partidos;

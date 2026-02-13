import React, { useMemo, useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { usePartido } from "../../../../../context/PartidoReducer";
import { useLineups } from "../../../../../context/LineUpProvider";
import { normalizeName } from "../../../../../utils/normalizeName";
import { useUserData } from "../../../../../hooks/useUserData";
import { Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../../../configuration/firebase";
import { toast } from "react-toastify";
import Notiflix from "notiflix";

const Ajustes = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const clubs = Object.keys(lineupState?.lineups || []);
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || "",
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;
  const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];
  console.log(bucket);

  const torneosUnicos = useMemo(() => {
    if (!matches) return [];
    const nombres = matches.map((m) => m.torneoName);
    return [...new Set(nombres)].sort();
  }, [matches]);

  const [configLocales, setConfigLocales] = useState({});
  const handleCambio = (torneo, campo, valor) => {
    setConfigLocales((prev) => ({
      ...prev,
      [torneo]: {
        ...prev[torneo],
        [campo]: valor,
      },
    }));
  };

  const handleSave = async (torneo) => {
    const formatoAGuardar =
      configLocales?.[torneo]?.formato ||
      bucket?.torneosConfig?.[torneo]?.formato ||
      "anual";

    try {
      const userRef = doc(db, "users", uid);

      await setDoc(
        userRef,
        {
          lineups: {
            [clubKey]: {
              torneosConfig: {
                [torneo]: { formato: formatoAGuardar },
              },
            },
          },
        },
        { merge: true },
      );

      lineupDispatch({
        type: "UPDATE_TORNEO_CONFIG",
        payload: { clubKey, torneo, settings: { formato: formatoAGuardar } },
      });

      Notiflix.Notify.success("¡Configuración guardada!");
    } catch (error) {
      console.error("Error al guardar:", error);
      Notiflix.Notify.error("No se pudo guardar la configuración");
    }
  };

  return (
    <div className="p-2 max-w-4xl mx-auto mb-10">
      {/* Encabezado Minimalista */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">⚙️ Configuración</h1>
        <Link
          to="/campeonatos"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-all"
        >
          Volver
        </Link>
      </div>

      {/* Tabla / Lista Minimalista */}
      <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="hidden md:table-header-group bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Campeonato
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Formato
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {torneosUnicos.length > 0 ? (
              torneosUnicos.map((torneo) => (
                <tr
                  key={torneo}
                  className="flex flex-col md:table-row hover:bg-slate-50/50 transition-colors"
                >
                  {/* Columna Campeonato */}
                  <td className="px-4 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-base">🏆</span>
                      <span className="font-bold md:font-medium text-slate-800 truncate">
                        {torneo}
                      </span>
                    </div>
                  </td>

                  {/* Columna Formato */}
                  <td className="px-4 py-2 md:py-4">
                    <label className="block md:hidden text-[10px] text-slate-400 uppercase font-bold mb-1">
                      Formato
                    </label>
                    <select
                      className="w-full md:w-auto text-sm border-slate-200 rounded-lg focus:ring-sky-500 bg-slate-50/50 py-1.5"
                      value={
                        configLocales[torneo]?.formato ||
                        bucket?.torneosConfig?.[torneo]?.formato ||
                        "anual"
                      }
                      onChange={(e) =>
                        handleCambio(torneo, "formato", e.target.value)
                      }
                    >
                      <option value="anual">Enero - Diciembre (Anual)</option>
                      <option value="europeo">Julio - Junio (Europeo)</option>
                    </select>
                  </td>

                  {/* Columna Guardar */}
                  <td className="px-4 py-4 md:py-4 text-center">
                    <button
                      className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 md:py-1.5 rounded-xl text-sm font-semibold shadow-sm shadow-sky-100 transition-all active:scale-95"
                      onClick={() => handleSave(torneo)}
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-10 text-center text-slate-400 text-sm"
                >
                  No hay torneos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ajustes;

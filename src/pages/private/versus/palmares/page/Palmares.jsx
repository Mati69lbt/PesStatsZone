// cspell: ignore Palmares
import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { pretty } from "../../../match/utils/pretty";

import { collection, getDocs, query, where } from "firebase/firestore";
import useAuth from "../../../../../hooks/useAuth";
import { db } from "../../../../../configuration/firebase"; 
import { useLineups } from "../../../../../context/LineUpProvider"; 
import { usePartido } from "../../../../../context/PartidoReducer"; 
import { normalizeName } from "../../../../../utils/normalizeName"; 
import { useUserData } from "../../../../../hooks/useUserData";

// Badge de color según resultado del campeonato
const getResultadoBadgeClasses = (resultado) => {
  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold border";

  switch (resultado) {
    case "campeon":
      return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
    case "subcampeon":
      return `${base} bg-amber-50 text-amber-700 border-amber-200`;
    case "3ro":
    case "tercero":
      return `${base} bg-sky-50 text-sky-700 border-sky-200`;
    default:
      return `${base} bg-slate-50 text-slate-700 border-slate-200`;
  }
};

// Helper para ordenar años (numérico descendente, “sin año” al final)
const ordenarYears = (years) => {
  const parseYear = (y) =>
    typeof y === "number" ? y : parseInt(String(y), 10);

  return [...years].sort((a, b) => {
    const aNum = parseYear(a);
    const bNum = parseYear(b);

    const aNaN = Number.isNaN(aNum);
    const bNaN = Number.isNaN(bNum);

    if (aNaN && bNaN) return String(a).localeCompare(String(b));
    if (aNaN) return 1; // “sin año” va abajo
    if (bNaN) return -1;

    // Más reciente primero
    return bNum - aNum;
  });
};

const Palmares = () => {
  const { uid } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  console.log(lineupState.lineups);
  

  const [data, setData] = useState(null);

  const clubs = Object.keys(lineupState?.lineups || []);
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || ""
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;

  const clubData = lineupState?.lineups?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0;
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;

  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }

  useEffect(() => {
    if (!bucket) return;
    if (Object.keys(bucket).length === 0) return;
    setData(bucket);
  }, [bucket]);

  // Traer palmarés de Firebase para el usuario logueado
  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    const cargar = async () => {
      try {
        setLoading(true);

        const ref = collection(db, "palmares");
        const q = query(ref, where("uid", "==", uid));
        const snap = await getDocs(q);

        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setItems(data);
      } catch (err) {
        console.error("Error cargando palmarés:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [uid]);

  // Agrupar por año y ordenar
  const grupos = useMemo(() => {
    if (!items.length) return [];

    const map = new Map();

    items.forEach((item) => {
      const year = item.year ?? "Sin año";
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year).push(item);
    });

    const yearsOrdenados = ordenarYears(Array.from(map.keys()));

    return yearsOrdenados.map((year) => {
      const campeonatos = map.get(year) || [];

      // Orden interno por nombre de torneo (alfabético)
      campeonatos.sort((a, b) =>
        String(a.torneoDisplay || "").localeCompare(
          String(b.torneoDisplay || "")
        )
      );

      return {
        year,
        campeonatos,
      };
    });
  }, [items]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-center">👑 Palmarés</h1>

      {loading && (
        <div className="text-center text-sm text-slate-500 mt-6">
          Cargando palmarés...
        </div>
      )}

      {!loading && !items.length && (
        <div className="text-center text-sm text-slate-500 mt-6">
          Todavía no guardaste resultados de campeonatos.
          <br />
          Usá la pantalla <span className="font-semibold">
            Campeonatos
          </span>{" "}
          para marcar la posición final en cada torneo.
        </div>
      )}

      {!loading &&
        grupos.map(({ year, campeonatos }) => (
          <section key={year} className="mb-6">
            {/* Encabezado de año */}
            <div className="w-full max-w-sm md:max-w-md mx-auto flex items-center gap-2 mb-2">
              <div className="w-8 h-px bg-slate-300 md:w-12" />
              <h2 className="text-sm md:text-base font-semibold text-slate-700">
                {Number.isNaN(parseInt(String(year), 10)) ? String(year) : year}
              </h2>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Lista de campeonatos (sin tabla) */}
            <div className="space-y-2">
              {campeonatos.map((item) => (
                <div
                  key={item.id}
                  className="w-full max-w-sm md:max-w-md mx-auto flex items-baseline justify-between gap-3 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-[12px] md:text-sm font-medium text-slate-900">
                      {item.torneoDisplay || "Sin nombre"}
                    </span>
                    {item.clubName && (
                      <span className="text-[10px] md:text-xs text-slate-500">
                        {pretty(item.clubName)}
                      </span>
                    )}
                    {item.matchesCount != null && (
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {item.matchesCount} partido
                        {item.matchesCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  {/* “Tabulación invisible”: resultado alineado a la derecha */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {item.resultado && (
                      <span
                        className={getResultadoBadgeClasses(item.resultado)}
                      >
                        {item.resultadoLabel || item.resultado}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
};

export default Palmares;

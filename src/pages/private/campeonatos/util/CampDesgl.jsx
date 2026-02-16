import React, { useMemo, useState, useEffect } from "react";
import { borrarPartido, prettySafe } from "../util/funtions";
import { db } from "../../../../configuration/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Notiflix from "notiflix";
import { useNavigate } from "react-router-dom";
import {
  RESULT_OPTIONS,
  normKey,
  splitCampFromMatch,
  getYearFromCamp,
} from "./utils";



import DuplicatesWarning from "./DuplicatesWarning";
import MatchCardMobile from "./MatchCardMobile";
import MatchRowDesktop from "./MatchRowDesktop";



const saveResultadoEnPalmares = async ({ uid, clubKey, camp, value }) => {
  if (!uid || !camp || !value) return;

  const year = getYearFromCamp(camp);
  const matchesCount = camp.matches?.length || 0;

  const opt = RESULT_OPTIONS.find((o) => o.value === value);
  const resultadoLabel = opt?.label || "";

  // Intentamos obtener un nombre legible de club desde el primer partido
  const firstMatch = camp.matches[0] || {};
  const clubName =
    firstMatch.club ||
    firstMatch.activeClubName ||
    firstMatch.activeClub ||
    clubKey ||
    "Sin club";

  const payload = {
    uid,
    clubKey,
    clubName,
    torneoDisplay: camp.nombre,
    resultado: value,
    resultadoLabel,
    matchesCount,
    year,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // ID determinístico para NO duplicar docs del mismo torneo+club+año
    const safeClub = String(clubName).replace(/\s+/g, "_");
    const safeTorneo = String(camp.nombre).replace(/\s+/g, "_");
    const safeYear = year ?? "NA";

    const docId = `${uid}_${safeClub}_${safeTorneo}_${safeYear}`;

    const ref = doc(db, "palmares", docId);

    await setDoc(ref, payload, { merge: true });

    Notiflix.Notify.success("Palmarés guardado");
  } catch (error) {
    Notiflix.Notify.failure("Error al guardar palmarés");
    console.log("error: ", error);
  }
};


const CampDesgl = ({
  matches = [],
  torneosConfig = {},
  clubKey,
  uid,
  onRefresh,
}) => {
  const navigate = useNavigate();

  const [resumenResultados, setResumenResultados] = useState({});

  // ✅ NUEVO: helper para “key” de fecha sin problemas de timezone
  const getDateKey = (m) => {
    const raw = m?.fecha || m?.createdAt;
    if (!raw) return null;

    // si viene "YYYY-MM-DD", lo usamos directo (evita corrimientos)
    if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;

    // clave local YYYY-MM-DD
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const getCampTitleFromMatch = (m) => {
    const { base, season } = splitCampFromMatch(m, torneosConfig);
    return `${prettySafe(base)}${season ? ` ${season}` : ""}`;
  };

  // ✅ NUEVO: detectar duplicados por fecha
  const duplicadosPorFecha = useMemo(() => {
    if (!Array.isArray(matches) || !matches.length) return [];

    const map = new Map(); // dateKey -> matches[]
    matches.forEach((m) => {
      const k = getDateKey(m);
      if (!k) return;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(m);
    });

    return Array.from(map.entries())
      .filter(([, arr]) => arr.length > 1)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [matches]);

  const campeonatos = useMemo(() => {
    if (!Array.isArray(matches)) return [];

    const map = new Map();

    matches.forEach((m) => {
      const { base, season } = splitCampFromMatch(m, torneosConfig);
      const key = `${normKey(base)}__${season ?? "NA"}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          nombre: base, // nombre limpio
          year: season ?? null, // "2022" o "2022-2023"
          matches: [],
          lastDate: null,
        });
      }

      const camp = map.get(key);
      camp.matches.push(m);

      const fecha = new Date(m.fecha || m.createdAt || 0);
      if (!camp.lastDate || fecha > camp.lastDate) {
        camp.lastDate = fecha;
      }
    });

    const arr = Array.from(map.values());

    // ordenar partidos (más recientes primero)
    arr.forEach((camp) => {
      camp.matches.sort((a, b) => {
        const fa = new Date(a.fecha || a.createdAt || 0).getTime();
        const fb = new Date(b.fecha || b.createdAt || 0).getTime();
        return fb - fa;
      });
    });

    // ordenar campeonatos por último partido
    arr.sort((a, b) => {
      const ta = a.lastDate ? a.lastDate.getTime() : 0;
      const tb = b.lastDate ? b.lastDate.getTime() : 0;
      return tb - ta;
    });

    return arr;
  }, [matches, torneosConfig]);

  // 2️⃣ Después: usamos campeonatos en el useEffect
  useEffect(() => {
    const cargarResultados = async () => {
      if (!uid) return;
      if (!campeonatos || !campeonatos.length) return;

      try {
        const torneosSet = new Set(campeonatos.map((c) => c.key));

        const ref = collection(db, "palmares");
        const q = query(ref, where("uid", "==", uid));
        const snap = await getDocs(q);

        const loaded = {};

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const value = data.resultado;
          const base = normKey(data.torneoDisplay);
          const year = data.year ?? null;
          const docKey = `${base}__${year ?? "NA"}`;

          if (torneosSet.has(docKey) && typeof value === "string") {
            loaded[docKey] = value;
          }
        });

        setResumenResultados((prev) => ({
          ...prev,
          ...loaded,
        }));
      } catch (error) {
        console.error("Error cargando palmarés:", error);
      }
    };

    cargarResultados();
  }, [uid, campeonatos]);

  const handleResultadoChange = async (camp, value) => {
    const torneoKey = camp.key;

    setResumenResultados((prev) => ({
      ...prev,
      [torneoKey]: value,
    }));

    try {
      await saveResultadoEnPalmares({
        uid,
        clubKey,
        camp,
        value,
      });
    } catch (err) {
      console.error("Error guardando en palmares:", err);
    }
  };

  if (!matches.length) {
    return null;
  }

  const handleDelete = (m) => {
    borrarPartido({
      match: m,
      uid,
      clubKey,
      onDone: async () => {
        if (typeof onRefresh === "function") {
          await onRefresh();
        }
      },
    });
  };

 return (
   <div className="mt-4">
     {/* ✅ NUEVO: advertencia fechas duplicadas */}
     <DuplicatesWarning
       duplicadosPorFecha={duplicadosPorFecha}
       prettySafe={prettySafe}
       getCampTitleFromMatch={getCampTitleFromMatch}
     />

     {campeonatos.map((camp) => {
       const torneoKey = camp.key;
       const valorSelect = resumenResultados[torneoKey] || "";
       const year = camp.year ?? getYearFromCamp(camp);
       const tituloCamp = `${prettySafe(camp.nombre)}${year ? ` ${year}` : ""}`;

       return (
         <div key={torneoKey} className="mb-6 flex justify-center">
           {/* Card única: header + tabla comparten ancho */}
           <div className="border border-slate-200 rounded-lg bg-white shadow-sm w-max">
             {/* Header del campeonato + select Resultado */}
             <div className="flex items-center flex-row justify-between gap-3 px-3 py-2 border-b border-slate-200 bg-slate-100 rounded-t-lg">
               <div className="min-w-0">
                 <h3 className="font-semibold text-sm lg:text-base text-slate-800 truncate">
                   {tituloCamp}
                 </h3>
                 <p className="text-[11px] text-slate-500">
                   {camp.matches.length} partido
                   {camp.matches.length !== 1 ? "s" : ""} jugado
                   {camp.matches.length !== 1 ? "s" : ""} en este campeonato.
                 </p>
               </div>

               <div className="text-[11px] md:text-sm shrink-0 md:flex md:items-center md:gap-2">
                 <label className="font-medium whitespace-nowrap mr-2">
                   Resultado:
                 </label>

                 <select
                   className="border border-slate-300 rounded px-2 py-1 text-[11px] md:text-sm bg-white"
                   value={valorSelect}
                   onChange={(e) => handleResultadoChange(camp, e.target.value)}
                 >
                   {RESULT_OPTIONS.map((opt) => (
                     <option key={opt.value} value={opt.value}>
                       {opt.label}
                     </option>
                   ))}
                 </select>
               </div>
             </div>

             {/* Mobile (cards) */}
             <div className="sm:hidden space-y-1">
               {camp.matches.map((m, index) => {
                 const nroJuego = camp.matches.length - index;

                 return (
                   <MatchCardMobile
                     key={m.id || `${m.fecha}-${m.rival}-${m.resultMatch}`}
                     m={m}
                     nroJuego={nroJuego}
                     prettySafe={prettySafe}
                     onEdit={(mm) => navigate(`/editar-partido/${mm.id}`)}
                     onDelete={handleDelete}
                   />
                 );
               })}
             </div>

             {/* Desktop (tabla) */}
             <div className="hidden sm:block overflow-x-auto">
               <table className="w-full table-fixed border-collapse text-[11px] lg:text-xs lg:w-max lg:min-w-[980px] lg:table-auto">
                 <thead className="bg-slate-100 text-slate-700">
                   <tr>
                     <th className="border border-slate-200 px-2 py-2 text-center whitespace-nowrap w-12">
                       Fecha
                     </th>

                     <th className="border border-slate-200 px-2 py-2 text-left whitespace-nowrap">
                       Resultado
                     </th>

                     <th className="border border-slate-200 px-2 py-2 text-center w-10 whitespace-nowrap">
                       <img
                         src="pencil.png"
                         alt="Editar"
                         className="inline-block h-5 w-5 opacity-60"
                       />
                     </th>

                     <th className="border border-slate-200 px-2 py-2 text-left whitespace-nowrap w-24">
                       Capitán
                     </th>

                     <th className="border border-slate-200 px-2 py-2 text-left whitespace-nowrap">
                       Goleadores Propios
                     </th>

                     <th className="border border-slate-200 px-2 py-2 text-left whitespace-nowrap">
                       Goles del Rival
                     </th>

                     <th className="border border-slate-200 px-2 py-2 text-center w-10 whitespace-nowrap">
                       <img
                         src="bas.png"
                         alt="Borrar"
                         className="inline-block h-5 w-5 opacity-60"
                       />
                     </th>
                   </tr>
                 </thead>

                 <tbody>
                   {camp.matches.map((m) => (
                     <MatchRowDesktop
                       key={m.id || `${m.fecha}-${m.rival}-${m.resultMatch}`}
                       m={m}
                       prettySafe={prettySafe}
                       onEdit={(mm) => navigate(`/editar-partido/${mm.id}`)}
                       onDelete={handleDelete}
                     />
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         </div>
       );
     })}
   </div>
 );

};

export default CampDesgl;

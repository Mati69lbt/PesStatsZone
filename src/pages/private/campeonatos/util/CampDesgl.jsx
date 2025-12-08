import React, { useMemo, useState, useEffect } from "react";
import { prettySafe } from "../util/funtions";
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

// Opciones del select "Resultado" del campeonato
const RESULT_OPTIONS = [
  { value: "", label: "Sin definir" },
  { value: "campeon", label: "Campeón" },
  { value: "subcampeon", label: "Sub Campeón" },
  { value: "3ro", label: "Tercero" },
  { value: "4to", label: "Cuarto" },
  { value: "5to", label: "Quinto" },
  { value: "6to", label: "Sexto" },
  { value: "7mo", label: "Séptimo" },
  { value: "8vo", label: "Octavo" },
  { value: "9no", label: "Noveno" },
  { value: "10mo", label: "Décimo" },
  { value: "lejos", label: "Lejos" },
  { value: "fase de grupos", label: "Fase de Grupos" },
  { value: "16 avos de final", label: "16 avos de Final" },
  { value: "32 avos de final", label: "32 avos de Final" },
  { value: "octavos de final", label: "Octavos de Final" },
  { value: "cuartos de final", label: "Cuartos de Final" },
  { value: "semi Final", label: "Semi Final" },
];

// Colores para el resultado del PARTIDO (ganado / empatado / perdido)
const getResultadoPartidoClasses = (final) => {
  switch (final) {
    case "ganado":
      return "bg-emerald-100 text-emerald-800 font-semibold";
    case "empatado":
      return "bg-amber-100 text-amber-800 font-semibold";
    case "perdido":
      return "bg-rose-100 text-rose-800 font-semibold";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

// Badge para condición (local / visitante / neutral)
const CondicionBadge = ({ condition }) => {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold";

  if (condition === "local") {
    return <span className={`${base} bg-blue-100 text-blue-800`}>Local</span>;
  }
  if (condition === "visitante") {
    return (
      <span className={`${base} bg-purple-100 text-purple-800`}>Visitante</span>
    );
  }
  if (condition === "neutral" || condition === "neutro") {
    return (
      <span className={`${base} bg-slate-100 text-slate-800`}>Neutral</span>
    );
  }

  return <span className={`${base} bg-slate-100 text-slate-600`}>-</span>;
};

// Calcula cuántos goles hizo un goleador según las banderas (gol, doblete, triplete, etc.)
const calcularGolesGoleador = (g) => {
  if (!g) return 0;

  // Ajustá esto si tenés poker, manito, etc. en el modelo
  if (g.triplete || g.hattrick) return 3;
  if (g.doblete) return 2;
  if (g.gol) return 1;

  return 0;
};

// Devuelve el string de goleadores propios: "Riquelme (2), Silva (1)"
const getGoleadoresPropiosTexto = (match) => {
  const lista = Array.isArray(match.goleadoresActiveClub)
    ? match.goleadoresActiveClub
    : [];

  const items = lista
    .map((g) => {
      const goles = calcularGolesGoleador(g);
      if (!g.name || goles <= 0) return null;
      return `${prettySafe(g.name)} (${goles})`;
    })
    .filter(Boolean);

  if (!items.length) return "—";

  return items.join(", ");
};

const getGoleadoresRivalesTexto = (match) => {
  const lista = Array.isArray(match.goleadoresRivales)
    ? match.goleadoresRivales
    : [];

  const items = lista
    .map((g) => {
      const goles = calcularGolesGoleador(g);
      if (!g.name || goles <= 0) return null;
      return `${prettySafe(g.name)} (${goles})`;
    })
    .filter(Boolean);

  if (!items.length) return "—";

  return items.join(", ");
};

// Saca el "year" a partir del torneoYear de los partidos del campeonato
const getYearFromCamp = (camp) => {
  if (!camp || !Array.isArray(camp.matches) || !camp.matches.length) {
    return null;
  }

  // Tomamos todos los torneoYear válidos
  const years = Array.from(
    new Set(
      camp.matches
        .map((m) => m.torneoYear)
        .filter((y) => y !== undefined && y !== null)
    )
  );

  if (!years.length) return null;

  // Si por algún motivo hubiera más de uno, nos quedamos con el primero.
  // (En tu data real debería ser siempre el mismo para ese torneo)
  return years[0];
};

// Guarda el resultado del campeonato en la colección "palmares"
// Guarda el resultado del campeonato en la colección "palmares"
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
    console.log("Guardado en palmares:", payload);
  } catch (error) {
    Notiflix.Notify.failure("Error al guardar palmarés");
    console.log("error: ", error);
  }
};

const CampDesgl = ({ matches = [], clubKey, uid }) => {
  const [resumenResultados, setResumenResultados] = useState({});

  // Al entrar a la página, cargar de Firestore los resultados ya guardados
  const campeonatos = useMemo(() => {
    if (!Array.isArray(matches)) return [];

    const map = new Map();

    matches.forEach((m) => {
      const key = m.torneoName || m.torneo || "Sin torneo";
      if (!map.has(key)) {
        map.set(key, {
          nombre: key,
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

    // ordenamos partidos dentro de cada torneo (más recientes primero)
    arr.forEach((camp) => {
      camp.matches.sort((a, b) => {
        const fa = new Date(a.fecha || a.createdAt || 0).getTime();
        const fb = new Date(b.fecha || b.createdAt || 0).getTime();
        return fb - fa;
      });
    });

    // ordenamos torneos por lastDate (más reciente primero)
    arr.sort((a, b) => {
      const ta = (a.lastDate || 0).getTime ? a.lastDate.getTime() : 0;
      const tb = (b.lastDate || 0).getTime ? b.lastDate.getTime() : 0;
      return tb - ta;
    });

    return arr;
  }, [matches]);

  // 2️⃣ Después: usamos campeonatos en el useEffect
  useEffect(() => {
    const cargarResultados = async () => {
      if (!uid) return;
      if (!campeonatos || !campeonatos.length) return;

      try {
        const torneosSet = new Set(campeonatos.map((c) => c.nombre));

        const ref = collection(db, "palmares");
        const q = query(ref, where("uid", "==", uid));
        const snap = await getDocs(q);

        const loaded = {};

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const torneo = data.torneoDisplay;
          const value = data.resultado;

          if (torneosSet.has(torneo) && typeof value === "string") {
            loaded[torneo] = value;
          }
        });

        setResumenResultados((prev) => ({
          ...loaded,
          ...prev,
        }));
      } catch (error) {
        console.error("Error cargando palmarés:", error);
      }
    };

    cargarResultados();
  }, [uid, campeonatos]);

  const handleResultadoChange = async (camp, value) => {
    const torneoKey = camp.nombre;

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

  return (
    <div className="mt-8">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-center">
        📋 Detalle de partidos por campeonato
      </h2>

      {campeonatos.map((camp) => {
        const torneoKey = camp.nombre;
        const valorSelect = resumenResultados[torneoKey] || "";

        return (
          <div
            key={torneoKey}
            className="mb-6 border border-slate-200 rounded-lg bg-white shadow-sm"
          >
            {/* Header del campeonato + select Resultado */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-3 py-2 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-slate-800">
                  {prettySafe(camp.nombre)}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {camp.matches.length} partido
                  {camp.matches.length !== 1 ? "s" : ""} jugado
                  {camp.matches.length !== 1 ? "s" : ""} en este campeonato.
                </p>
              </div>

              <div className="text-[11px] md:text-sm">
                <label className="mr-2 font-medium">Resultado:</label>
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

            {/* Tabla de partidos de ese campeonato */}
            <div className="overflow-x-auto text-[11px] md:text-xs">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-200 px-2 py-1 text-left">
                      Rival
                    </th>
                    <th className="border border-slate-200 px-2 py-1 text-center">
                      Resultado
                    </th>
                    <th className="border border-slate-200 px-2 py-1 text-center">
                      Condición
                    </th>
                    <th className="border border-slate-200 px-2 py-1 text-left">
                      Capitán
                    </th>
                    <th className="border border-slate-200 px-2 py-1 text-left">
                      Goleadores propios
                    </th>
                    <th className="border border-slate-200 px-2 py-1 text-center">
                      Goles rival
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {camp.matches.map((m) => (
                    <tr
                      key={m.id || `${m.fecha}-${m.rival}-${m.resultMatch}`}
                      className="even:bg-slate-50"
                    >
                      {/* Rival */}
                      <td className="border border-slate-200 px-2 py-1 text-left">
                        {prettySafe(m.rival || "")}
                      </td>

                      {/* Resultado del partido (pintado por final) */}
                      <td className="border border-slate-200 px-2 py-1 text-left">
                        <span
                          className={
                            "inline-block px-2 py-0.5 rounded-full text-[10px] " +
                            getResultadoPartidoClasses(m.final)
                          }
                        >
                          {prettySafe(m.resultMatch || "")}
                        </span>
                      </td>

                      {/* Condición */}
                      <td className="border border-slate-200 px-2 py-1 text-center">
                        <CondicionBadge condition={m.condition} />
                      </td>

                      {/* Capitán */}
                      <td className="border border-slate-200 px-2 py-1 text-left">
                        {m.captain ? prettySafe(m.captain) : "—"}
                      </td>

                      {/* Goleadores propios */}
                      <td className="border border-slate-200 px-2 py-1 text-left">
                        {getGoleadoresPropiosTexto(m)}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-left">
                        {getGoleadoresRivalesTexto(m)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampDesgl;

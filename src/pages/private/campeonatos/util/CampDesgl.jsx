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

// Opciones del select "Resultado" del campeonato

const formatDDMM = (m) => {
  const raw = m?.fecha || m?.createdAt;
  if (!raw) return "—";

  const d =
    typeof raw === "string" ? new Date(`${raw}T00:00:00`) : new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};

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
      return goles === 1
        ? `${prettySafe(g.name)}`
        : `${prettySafe(g.name)} (${goles})`;
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
      return goles === 1
        ? `${prettySafe(g.name)}`
        : `${prettySafe(g.name)} (${goles})`;
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
  } catch (error) {
    Notiflix.Notify.failure("Error al guardar palmarés");
    console.log("error: ", error);
  }
};

const CampDesgl = ({ matches = [], clubKey, uid, onRefresh }) => {
  const navigate = useNavigate();

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
      {campeonatos.map((camp) => {
        const torneoKey = camp.nombre;
        const valorSelect = resumenResultados[torneoKey] || "";
        const year = getYearFromCamp(camp);
        const tituloCamp = `${prettySafe(camp.nombre)}${
          year ? ` ${year}` : ""
        }`;
        return (
          <div key={torneoKey} className="mb-6 flex justify-center">
            {/* Card única: header + tabla comparten ancho */}
            <div className="border border-slate-200 rounded-lg bg-white shadow-sm w-max ">
              {/* Header del campeonato + select Resultado */}
              <div className="flex   items-center  flex-row  justify-between gap-3 px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-lg">
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
                    onChange={(e) =>
                      handleResultadoChange(camp, e.target.value)
                    }
                  >
                    {RESULT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* { 2 renglones */}
              <div className="sm:hidden space-y-3">
                {camp.matches.map((m) => (
                  <div
                    key={m.id || `${m.fecha}-${m.rival}-${m.resultMatch}`}
                    className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                  >
                    {/* Fila 1: Fecha + Resultado + Acciones */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50">
                      <div className="text-xs tabular-nums">
                        {formatDDMM(m)}
                      </div>

                      <span
                        className={
                          "px-2 py-0.5 rounded-full text-[12px] whitespace-nowrap " +
                          getResultadoPartidoClasses(m.final)
                        }
                      >
                        {prettySafe(m.resultMatch || "")}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="cursor-pointer disabled:opacity-40"
                          disabled={!m.id}
                          title="Editar partido"
                          onClick={() => navigate(`/editar-partido/${m.id}`)}
                        >
                          <img
                            src="pencil.png"
                            alt="Editar"
                            className="h-6 w-6"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(m)}
                          className="cursor-pointer"
                          title="Borrar partido"
                        >
                          <img src="bas.png" alt="Borrar" className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Fila 2: Detalles */}
                    <div className="px-3 py-2 text-[12px] space-y-1">
                      <div className="flex gap-2">
                        <span className="text-slate-500 min-w-[72px]">
                          Capitán
                        </span>
                        <span className="font-medium">
                          {m.captain ? prettySafe(m.captain) : "—"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-slate-500 min-w-[72px]">
                          Goles
                        </span>
                        <span>{getGoleadoresPropiosTexto(m)}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-slate-500 min-w-[72px]">
                          Rival
                        </span>
                        <span>{getGoleadoresRivalesTexto(m)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* { fin 2 renglones */}

              {/* Tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <div className="flex justify-center">
                  <table className="w-full table-fixed border-collapse text-[11px] lg:text-xs lg:w-max lg:min-w-[980px] lg:table-auto">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="border border-slate-200 px-2 py-2 text-center whitespace-nowrap w-12">
                          Fecha
                        </th>

                        <th className="border border-slate-200 px-2 py-2 text-center sm:w-80">
                          Resultado
                        </th>

                        <th className="border border-slate-200 px-2 py-2 text-center whitespace-nowrap w-14">
                          <img
                            src="penc.png"
                            alt="Editar"
                            className="inline-block h-5 w-5 align-middle"
                          />
                        </th>

                        <th className="border border-slate-200 px-2 py-2 text-left whitespace-nowrap md:w-12">
                          Capitán
                        </th>

                        <th className="border border-slate-200 px-2 py-2 text-left min-w-[200px] md:w-40">
                          Goleadores Propios
                        </th>

                        <th className="border border-slate-200 px-2 py-2 text-left min-w-[200px] md:w-40">
                          Goles del Rival
                        </th>

                        <th className="border border-slate-200 px-2 py-2 text-center whitespace-nowrap w-14">
                          <img
                            src="basu.png"
                            alt="Borrar"
                            className="inline-block h-5 w-5 align-middle"
                          />
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {camp.matches.map((m) => (
                        <tr
                          key={m.id || `${m.fecha}-${m.rival}-${m.resultMatch}`}
                          className="even:bg-slate-50"
                        >
                          <td className="border border-slate-200 px-2 py-2 text-center tabular-nums">
                            {formatDDMM(m)}
                          </td>

                          <td className="border border-slate-200 px-2 py-2 text-left">
                            <span
                              className={
                                "inline-block px-2 py-0.5 rounded-full text-[12px] whitespace-nowrap " +
                                getResultadoPartidoClasses(m.final)
                              }
                            >
                              {prettySafe(m.resultMatch || "")}
                            </span>
                          </td>

                          <td className="border border-slate-200 px-2 py-2 text-center">
                            <button
                              type="button"
                              className="cursor-pointer"
                              disabled={!m.id}
                              title="Editar partido"
                              onClick={() =>
                                navigate(`/editar-partido/${m.id}`)
                              }
                            >
                              <img
                                src="pencil.png"
                                alt="Editar"
                                className="inline-block h-6 w-6"
                              />
                            </button>
                          </td>

                          <td className="border border-slate-200 px-2 py-2 text-left">
                            {m.captain ? prettySafe(m.captain) : "—"}
                          </td>

                          <td className="border border-slate-200 px-2 py-2 text-left">
                            {getGoleadoresPropiosTexto(m)}
                          </td>

                          <td className="border border-slate-200 px-2 py-2 text-left">
                            {getGoleadoresRivalesTexto(m)}
                          </td>

                          <td className="border border-slate-200 px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              className="inline-flex items-center justify-center cursor-pointer"
                              title="Borrar partido"
                            >
                              <img
                                src="bas.png"
                                alt="Borrar"
                                className="inline-block h-6 w-6"
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampDesgl;

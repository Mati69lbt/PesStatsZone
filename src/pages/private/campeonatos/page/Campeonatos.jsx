// cspell: ignore Efec Segun Yefectividad resumenes Ressumenes
import React, { useMemo, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { normalizeName } from "../../../../utils/normalizeName";
import useRessumenesMemo from "../hooks/useRessumenesMemo";
import useClavesOrdenadasMemo from "../hooks/useClavesOrdenadasMemo";
import {
  getColorSegunResultado,
  getDG,
  prettySafe,
  puntosYefectividad,
} from "../util/funtions";
import { Navigate } from "react-router-dom";
import { fetchUserData, useUserData } from "../../../../hooks/useUserData";

// ✅ NUEVO: círculo para DG y G/P (fondo blanco + ring con color)
const StatCircle = ({ value = 0, title = "", showPlus = false }) => {
  const n = Number(value || 0);
  const ring =
    n > 0 ? "ring-emerald-600" : n < 0 ? "ring-rose-600" : "ring-yellow-500";
  const txt = showPlus && n > 0 ? `+${n}` : `${n}`;
  return (
    <span
      className={`mx-auto inline-flex items-center justify-center rounded-full bg-white ring-2 ${ring}
        h-6 w-6 md:h-7 md:w-7 text-[10px] md:text-[11px] font-extrabold text-black tabular-nums`}
      title={title}
    >
      {txt}
    </span>
  );
};

const Campeonatos = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const refreshData = async () => {
    if (!uid) return;
    await fetchUserData(uid, matchDispatch, lineupDispatch);
  };

  const clubs = Object.keys(lineupState?.lineups || []);
  const [selectedClub, setSelectedClub] = useState(
    lineupState?.activeClub || clubs[0] || ""
  );

  const clubKey = normalizeName(selectedClub || "");
  const bucket = clubKey ? lineupState?.lineups?.[clubKey] : null;
  const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];

  const [orden, setOrden] = useState("desc"); // "asc" | "desc"

  const resumenes = useRessumenesMemo(matches);
  const clavesOrdenadas = useClavesOrdenadasMemo(resumenes, orden);

  const clubData = lineupState?.lineups?.[clubKey] || {};
  const hasPlayers = (clubData.players?.length ?? 0) > 0;
  const hasFormations = (clubData.formations?.length ?? 0) > 0;
  const hasPlayerStats = clubData.playersStats
    ? Object.keys(clubData.playersStats).length > 0
    : false;

  const hasLineupsLoaded =
    lineupState?.lineups && Object.keys(lineupState.lineups).length > 0;

  if (!hasLineupsLoaded) {
    return (
      <div className="p-6 text-center text-slate-500">Cargando datos...</div>
    );
  }

  if (!clubKey || (!hasPlayers && !hasFormations && !hasPlayerStats)) {
    return <Navigate to="/formacion" replace />;
  }

  const clavesPorAnio = useMemo(() => {
    const norm = (s) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    // 1) índice por torneoDisplay y torneoName (por si tu clave coincide con uno u otro)
    const yearByDisplay = new Map();
    const yearByName = new Map();

    for (const m of matches || []) {
      const y = Number(m?.torneoYear) || null;
      if (!y) continue;

      const d = norm(m?.torneoDisplay);
      const n = norm(m?.torneoName);

      if (d) yearByDisplay.set(d, y);
      if (n) yearByName.set(n, y);
    }

    // 2) agrupar claves
    const groups = new Map(); // year -> claves[]
    for (const clave of clavesOrdenadas || []) {
      const k = norm(clave);

      // a) si la clave ya tiene año en el texto (ej: "Primera Etapa 2020")
      const mYear = String(clave).match(/\b(19|20)\d{2}\b/);
      let year = mYear ? Number(mYear[0]) : null;

      // b) fallback: buscar en matches por display o name
      if (!year) year = yearByDisplay.get(k) || yearByName.get(k) || null;

      const bucket = year ?? 0; // 0 = "Sin año"
      if (!groups.has(bucket)) groups.set(bucket, []);
      groups.get(bucket).push(clave);
    }

    // 3) ordenar años desc (más nuevo primero), dejando "Sin año" al final
    const years = Array.from(groups.keys()).sort((a, b) => {
      if (a === 0) return 1;
      if (b === 0) return -1;
      return b - a;
    });

    return years.map((y) => ({
      year: y,
      claves: groups.get(y),
    }));
  }, [matches, clavesOrdenadas]);

  return (
    <div className="p-1 max-w-screen-2xl mx-auto">
      {/* ✅ Header más lindo */}
      <h1 className="mb-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
        🏆 Campeonatos
      </h1>

      {/* ✅ Controles (más prolijos) */}
      <div className="mb-4 flex flex-wrap items-end justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-center">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Club
          </label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            aria-label="Seleccionar club"
          >
            {clubs.map((c) => (
              <option key={c} value={c}>
                {prettySafe(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Orden
          </label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            aria-label="Ordenar campeonatos"
          >
            <option value="desc">Más nuevos primero</option>
            <option value="asc">Más viejos primero</option>
          </select>
        </div>
      </div>

      {/* ========================= */}
      {/* ✅ MOBILE: 3 filas por campeonato */}
      {/* ========================= */}
      <div className="lg:hidden max-h-[75vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm w-full">
        <div className="flex justify-center p-2">
          <table className="w-max text-[12px] md:text-sm border-separate border-spacing-px bg-white">
            <thead className="sticky top-0 z-10 bg-sky-50 text-slate-700 font-semibold shadow-sm text-[10px] uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left border-b border-slate-200 w-[40px]">
                  Campeonato
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  PJ
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  G
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  E
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  P
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  G/P
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  GF
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  GC
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  DG
                </th>
                <th className="px-2 py-2 text-center border-b border-slate-200">
                  Pts / Efec.
                </th>
              </tr>
            </thead>

            <tbody>
              {clavesOrdenadas.map((clave) => {
                const r = resumenes?.[clave];
                if (!r) return null; // ✅ evita crash si falta data

                const dgG = getDG(r.general);
                const dgL = getDG(r.local);
                const dgV = getDG(r.visitante);

                // ✅ NUEVO: G/P
                const gpG =
                  Number(r.general?.g || 0) - Number(r.general?.p || 0);
                const gpL = Number(r.local?.g || 0) - Number(r.local?.p || 0);
                const gpV =
                  Number(r.visitante?.g || 0) - Number(r.visitante?.p || 0);

                const colGen = getColorSegunResultado(r.general);
                const colLoc = getColorSegunResultado(r.local);
                const colVis = getColorSegunResultado(r.visitante);

                const {
                  puntos: ptsG,
                  efectividad: efG,
                  posibles: poG,
                } = puntosYefectividad(r.general);
                const {
                  puntos: ptsL,
                  efectividad: efL,
                  posibles: poL,
                } = puntosYefectividad(r.local);
                const {
                  puntos: ptsV,
                  efectividad: efV,
                  posibles: poV,
                } = puntosYefectividad(r.visitante);

                return (
                  <React.Fragment key={clave}>
                    {/* GENERAL */}
                    <tr className="border-t border-slate-100 bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-1.5 font-semibold text-center text-slate-800">
                        {prettySafe(clave)}
                      </td>
                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        {r.general.pj}
                      </td>
                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        {r.general.g}
                      </td>
                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        {r.general.e}
                      </td>
                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        {r.general.p}
                      </td>
                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        <StatCircle
                          value={gpG}
                          title={`G/P = ${r.general.g} - ${r.general.p} = ${gpG}`}
                        />
                      </td>

                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        {r.general.gf}
                      </td>
                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        {r.general.gc}
                      </td>
                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        <StatCircle
                          value={dgG}
                          showPlus
                          title={`DG = ${dgG}`}
                        />
                      </td>

                      <td className={`px-2 py-1 text-center ${colGen}`}>
                        {ptsG} / {poG} {efG}
                      </td>
                    </tr>

                    {/* LOCAL */}
                    <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <td className="px-3 py-1 text-right text-[10px] uppercase tracking-wide text-slate-600">
                        LOCAL
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        {r.local.pj}
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        {r.local.g}
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        {r.local.e}
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        {r.local.p}
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        <StatCircle
                          value={gpG}
                          title={`G/P = ${r.local.g} - ${r.local.p} = ${gpL}`}
                        />
                      </td>

                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        {r.local.gf}
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        {r.local.gc}
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        <StatCircle
                          value={dgL}
                          showPlus
                          title={`DG = ${dgL}`}
                        />
                      </td>
                      <td className={`px-2 py-1 text-center ${colLoc}`}>
                        {ptsL} / {poL} {efL}
                      </td>
                    </tr>

                    {/* VISITANTE */}
                    <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <td className="px-3 py-1 text-right text-[10px] uppercase tracking-wide text-slate-600">
                        VISITANTE
                      </td>
                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        {r.visitante.pj}
                      </td>
                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        {r.visitante.g}
                      </td>
                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        {r.visitante.e}
                      </td>
                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        {r.visitante.p}
                      </td>
                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        <StatCircle
                          value={gpG}
                          title={`G/P = ${r.visitante.g} - ${r.visitante.p} = ${gpV}`}
                        />
                      </td>

                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        {r.visitante.gf}
                      </td>
                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        {r.visitante.gc}
                      </td>
                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        <StatCircle
                          value={dgV}
                          showPlus
                          title={`DG = ${dgV}`}
                        />
                      </td>

                      <td className={`px-2 py-1 text-center ${colVis}`}>
                        {ptsV} / {poV} {efV}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {clavesOrdenadas.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-4 text-center text-slate-500"
                    colSpan={10}
                  >
                    No hay partidos cargados para este club.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================= */}
      {/* ✅ DESKTOP/TABLET: tabla completa */}
      {/* ========================= */}
      <div className="hidden lg:block max-h-[75vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
        <table className="mx-auto w-max table-auto text-[11px] md:text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-sky-50 text-slate-700 font-semibold shadow-sm text-[10px] md:text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 text-left border-b border-slate-200">
                Campeonato
              </th>

              {/* General */}
              <th className="px-2 py-2 text-center border-b border-slate-200">
                PJ
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                G
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                E
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                P
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                G/P
              </th>

              <th className="px-2 py-2 text-center border-b border-slate-200">
                GF
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                GC
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                DG
              </th>
              <th className="px-2 py-2 text-center border-b  border-r border-slate-300">
                Pts / Efec.
              </th>

              {/* Local */}
              <th className="px-2 py-2 text-center border-b border-slate-200">
                PJ L
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                G L
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                E L
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                P L
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                G/P L
              </th>

              <th className="px-2 py-2 text-center border-b border-slate-200">
                GF L
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                GC L
              </th>
              <th className="px-2 py-2 text-center border-b  border-r border-slate-300">
                DG L
              </th>

              {/* Visitante */}
              <th className="px-2 py-2 text-center border-b border-slate-200">
                PJ V
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                G V
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                E V
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                P V
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                G/P V
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                GF V
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                GC V
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                DG V
              </th>
            </tr>
          </thead>

          <tbody>
            {clavesOrdenadas.map((clave, idx) => {
              const r = resumenes?.[clave];
              if (!r) return null; // ✅ evita crash si falta data

              const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";

              const dg = getDG(r.general);
              const dgL = getDG(r.local);
              const dgV = getDG(r.visitante);

              // ✅ NUEVO: G/P
              const gp = Number(r.general?.g || 0) - Number(r.general?.p || 0);
              const gpL = Number(r.local?.g || 0) - Number(r.local?.p || 0);
              const gpV =
                Number(r.visitante?.g || 0) - Number(r.visitante?.p || 0);

              const colGen = getColorSegunResultado(r.general);
              const colLoc = getColorSegunResultado(r.local);
              const colVis = getColorSegunResultado(r.visitante);

              const { puntos, efectividad, posibles } = puntosYefectividad(
                r.general
              );

              return (
                <tr
                  key={clave}
                  className={`${rowBg} border-t border-slate-100 hover:bg-slate-100/70 transition-colors`}
                >
                  <td className="px-3 py-1.5 font-semibold text-left text-slate-800">
                    {prettySafe(clave)}
                  </td>

                  {/* General */}
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    {r.general.pj}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    {r.general.g}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    {r.general.e}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    {r.general.p}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    <StatCircle
                      value={gp}
                      title={`G/P = ${r.general.g} - ${r.general.p} = ${gp}`}
                    />
                  </td>

                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    {r.general.gf}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    {r.general.gc}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    <StatCircle value={dg} showPlus title={`DG = ${dg}`} />
                  </td>

                  <td
                    className={`px-2 py-1 text-center ${colGen} border-r border-slate-200`}
                  >
                    {puntos} / {posibles} - {efectividad}
                  </td>

                  {/* Local */}
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    {r.local.pj}
                  </td>
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    {r.local.g}
                  </td>
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    {r.local.e}
                  </td>
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    {r.local.p}
                  </td>
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    <StatCircle
                      value={gpL}
                      title={`G/P = ${r.local.g} - ${r.local.p} = ${gpL}`}
                    />
                  </td>
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    {r.local.gf}
                  </td>
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    {r.local.gc}
                  </td>
                  <td
                    className={`px-2 py-1 text-center ${colLoc} border-r border-slate-200`}
                  >
                    <StatCircle value={dgL} showPlus title={`DG = ${dgL}`} />
                  </td>

                  {/* Visitante */}
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.pj}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.g}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.e}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.p}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    <StatCircle
                      value={gpV}
                      title={`G/P = ${r.visitante.g} - ${r.visitante.p} = ${gpV}`}
                    />
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.gf}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.gc}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    <StatCircle value={dgV} showPlus title={`DG = ${dgV}`} />
                  </td>
                </tr>
              );
            })}

            {clavesOrdenadas.length === 0 && (
              <tr>
                <td
                  className="px-2 py-4 text-center text-slate-500"
                  colSpan={26}
                >
                  No hay partidos cargados para este club.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Campeonatos;

// cspell: ignore Efec Segun Yefectividad resumenes Ressumenes
import React, { useState } from "react";
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
import CampDesgl from "../util/CampDesgl";

const Campeonatos = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

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

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🏆 Campeonatos</h1>

      {/* Controles: mismo patrón que Versus */}
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
                {prettySafe(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <label className="text-sm font-medium block">Orden</label>
          <select
            className="border p-1 rounded text-sm"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="desc">Más nuevos primero</option>
            <option value="asc">Más viejos primero</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {/* Vista MOBILE: layout apilado (sm:hidden) */}
      <div className="md:hidden max-h-[75vh] overflow-auto border border-slate-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-[11px] md:text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-sky-50 text-slate-700 font-semibold shadow-sm text-[10px] uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 text-left border-b border-slate-200">
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
              const r = resumenes[clave];

              const dgG = getDG(r.general);
              const dgL = getDG(r.local);
              const dgV = getDG(r.visitante);

              const colGen = getColorSegunResultado(r.general);
              const colLoc = getColorSegunResultado(r.local);
              const colVis = getColorSegunResultado(r.visitante);

              const { puntos: ptsG, efectividad: efG } = puntosYefectividad(
                r.general
              );
              const { puntos: ptsL, efectividad: efL } = puntosYefectividad(
                r.local
              );
              const { puntos: ptsV, efectividad: efV } = puntosYefectividad(
                r.visitante
              );

              return (
                <React.Fragment key={clave}>
                  {/* Fila GENERAL → nombre del campeonato */}
                  <tr className="border-t border-slate-100 bg-white hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-1.5 font-semibold text-left text-slate-800">
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
                      {r.general.gf}
                    </td>
                    <td className={`px-2 py-1 text-center ${colGen}`}>
                      {r.general.gc}
                    </td>
                    <td className={`px-2 py-1 text-center ${colGen}`}>{dgG}</td>
                    <td className={`px-2 py-1 text-center ${colGen}`}>
                      {ptsG} / {efG}
                    </td>
                  </tr>

                  {/* Fila LOCAL */}
                  <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                    <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
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
                      {r.local.gf}
                    </td>
                    <td className={`px-2 py-1 text-center ${colLoc}`}>
                      {r.local.gc}
                    </td>
                    <td className={`px-2 py-1 text-center ${colLoc}`}>{dgL}</td>
                    <td className={`px-2 py-1 text-center ${colLoc}`}>
                      {ptsL} / {efL}
                    </td>
                  </tr>

                  {/* Fila VISITANTE */}
                  <tr className="border-t border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                    <td className="px-3 py-1 text-left text-[10px] uppercase tracking-wide text-slate-600">
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
                      {r.visitante.gf}
                    </td>
                    <td className={`px-2 py-1 text-center ${colVis}`}>
                      {r.visitante.gc}
                    </td>
                    <td className={`px-2 py-1 text-center ${colVis}`}>{dgV}</td>
                    <td className={`px-2 py-1 text-center ${colVis}`}>
                      {ptsV} / {efV}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}

            {clavesOrdenadas.length === 0 && (
              <tr>
                <td
                  className="px-2 py-4 text-center text-slate-500"
                  colSpan={9}
                >
                  No hay partidos cargados para este club.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista DESKTOP/TABLET: tabla completa (hidden en mobile) */}
      <div className="hidden md:block max-h-[75vh] overflow-auto border border-slate-200 rounded-lg bg-white shadow-sm">
        <table className="mx-auto w-full min-w-[900px] text-[11px] md:text-sm border-collapse">
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
                GF
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                GC
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                DG
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200 border-r border-slate-300">
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
                GF L
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200">
                GC L
              </th>
              <th className="px-2 py-2 text-center border-b border-slate-200 border-r border-slate-300">
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
              const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
              const r = resumenes[clave];

              const dg = getDG(r.general);
              const dgL = getDG(r.local);
              const dgV = getDG(r.visitante);

              const colGen = getColorSegunResultado(r.general);
              const colLoc = getColorSegunResultado(r.local);
              const colVis = getColorSegunResultado(r.visitante);

              const { puntos, efectividad } = puntosYefectividad(r.general);

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
                    {r.general.gf}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>
                    {r.general.gc}
                  </td>
                  <td className={`px-2 py-1 text-center ${colGen}`}>{dg}</td>
                  <td
                    className={`px-2 py-1 text-center ${colGen} border-r border-slate-200`}
                  >
                    {puntos} / {efectividad}
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
                    {r.local.gf}
                  </td>
                  <td className={`px-2 py-1 text-center ${colLoc}`}>
                    {r.local.gc}
                  </td>
                  <td
                    className={`px-2 py-1 text-center ${colLoc} border-r border-slate-200`}
                  >
                    {dgL}
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
                    {r.visitante.gf}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.gc}
                  </td>
                  <td className={`px-2 py-1 text-center ${colVis}`}>{dgV}</td>
                </tr>
              );
            })}

            {clavesOrdenadas.length === 0 && (
              <tr>
                <td
                  className="px-2 py-4 text-center text-slate-500"
                  colSpan={23}
                >
                  No hay partidos cargados para este club.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <CampDesgl matches={matches} clubKey={clubKey} uid={uid} />
    </div>
  );
};

export default Campeonatos;

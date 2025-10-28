// cspell: ignore Efec Segun Yefectividad resumenes Ressumenes
import React, { useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePartido } from "../../../../context/PartidoReducer";
import { useLineups } from "../../../../context/LineUpProvider";
import { normalizeName } from "../../../../utils/normalizeName";
import useRessumenesMemo from "../hooks/useRessumenesMemo";
import useClavesOrdenadasMemo from "../hooks/useClavesOrdenadasMemo";
import { getColorSegunResultado, getDG, prettySafe, puntosYefectividad } from "../util/funtions";

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
      <div className="max-h-[75vh] overflow-auto border rounded">
        <table className="border mx-auto text-[11px] md:text-sm w-full min-w-[900px]">
          <thead className="bg-blue-200 text-black font-semibold sticky top-0 shadow-lg">
            <tr>
              <th className="border px-2 py-1 text-center">Campeonato</th>

              <th className="border px-2 py-1 text-center">PJ</th>
              <th className="border px-2 py-1 text-center">G</th>
              <th className="border px-2 py-1 text-center">E</th>
              <th className="border px-2 py-1 text-center">P</th>
              <th className="border px-2 py-1 text-center">GF</th>
              <th className="border px-2 py-1 text-center">GC</th>
              <th className="border px-2 py-1 text-center">DG</th>
              <th className="border px-2 py-1 text-center">Pts / Efec.</th>

              <th className="border px-2 py-1 text-center">PJ L</th>
              <th className="border px-2 py-1 text-center">G L</th>
              <th className="border px-2 py-1 text-center">E L</th>
              <th className="border px-2 py-1 text-center">P L</th>
              <th className="border px-2 py-1 text-center">GF L</th>
              <th className="border px-2 py-1 text-center">GC L</th>
              <th className="border px-2 py-1 text-center">DG L</th>

              <th className="border px-2 py-1 text-center">PJ V</th>
              <th className="border px-2 py-1 text-center">G V</th>
              <th className="border px-2 py-1 text-center">E V</th>
              <th className="border px-2 py-1 text-center">P V</th>
              <th className="border px-2 py-1 text-center">GF V</th>
              <th className="border px-2 py-1 text-center">GC V</th>
              <th className="border px-2 py-1 text-center">DG V</th>
            </tr>
          </thead>
          <tbody>
            {clavesOrdenadas.map((clave, idx) => {
              const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-200";
              const r = resumenes[clave];

              const dg = getDG(r.general);
              const dgL = getDG(r.local);
              const dgV = getDG(r.visitante);

              const colGen = getColorSegunResultado(r.general);
              const colLoc = getColorSegunResultado(r.local);
              const colVis = getColorSegunResultado(r.visitante);

              const { puntos, efectividad } = puntosYefectividad(r.general);

              return (
                <tr key={clave} className={rowBg}>
                  <td className="border px-2 py-1 font-semibold text-left">
                    {prettySafe(clave)}
                  </td>

                  {/* General */}
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {r.general.pj}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {r.general.g}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {r.general.e}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {r.general.p}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {r.general.gf}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {r.general.gc}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {dg}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colGen}`}>
                    {puntos} / {efectividad}
                  </td>

                  {/* Local */}
                  <td className={`border px-2 py-1 text-center ${colLoc}`}>
                    {r.local.pj}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colLoc}`}>
                    {r.local.g}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colLoc}`}>
                    {r.local.e}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colLoc}`}>
                    {r.local.p}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colLoc}`}>
                    {r.local.gf}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colLoc}`}>
                    {r.local.gc}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colLoc}`}>
                    {dgL}
                  </td>

                  {/* Visitante */}
                  <td className={`border px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.pj}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.g}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.e}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.p}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.gf}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colVis}`}>
                    {r.visitante.gc}
                  </td>
                  <td className={`border px-2 py-1 text-center ${colVis}`}>
                    {dgV}
                  </td>
                </tr>
              );
            })}
            {clavesOrdenadas.length === 0 && (
              <tr>
                <td className="border px-2 py-4 text-center" colSpan={23}>
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

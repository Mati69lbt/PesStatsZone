import React from "react";
import { prettySafe } from "../../../../campeonatos/util/funtions";

const Gol_Tabla = ({
  ambito,
  ordenCampo,
  setOrdenCampo,
  ordenDireccion,
  setOrdenDireccion,
  goleadoresOrdenados,
}) => {
  const formatProm = (num) => {
    if (!num || Number.isNaN(num)) return "0.00";
    return Number(num).toFixed(2);
  };

  const campoHighlight = "bg-blue-50/70 font-semibold border-x-blue-100/50";

  const tituloAmbito =
    ambito === "general"
      ? "General"
      : ambito === "local"
        ? "Local"
        : ambito === "visitante"
          ? "Visitante"
          : "Neutro";

  // ✅ TOTALES (según el ámbito actual)
  const totals = React.useMemo(() => {
    const list = goleadoresOrdenados || [];

    const totalGoles = list.reduce(
      (acc, x) => acc + (x?.[ambito]?.goles || 0),
      0,
    );
    const totalx2 = list.reduce((acc, x) => acc + (x?.[ambito]?.x2 || 0), 0);
    const totalx3 = list.reduce((acc, x) => acc + (x?.[ambito]?.x3 || 0), 0);

    // ✅ Promedio de promedios (cada jugador pesa igual)
    const sumProms = list.reduce((acc, x) => acc + (x?.[ambito]?.prom || 0), 0);
    const promProms = list.length ? sumProms / list.length : 0;

    return {
      totalGoles,
      totalx2,
      totalx3,
      promProms: Number(promProms).toFixed(2),
    };
  }, [goleadoresOrdenados, ambito]);

  if (!goleadoresOrdenados?.length) {
    return (
      <p className="text-center text-sm text-slate-500 mt-4">
        No hay goleadores para {tituloAmbito}.
      </p>
    );
  }

 return (
   <div className="mt-1">
     {/* 📱 VISTA CELULAR (sm:hidden) */}
     <div className="sm:hidden max-h-[80vh] overflow-auto border rounded">
       <table className="w-full border-collapse text-[11px] tabular-nums">
         <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700">
           <tr>
             <th className="border px-2 py-2 text-center w-10">#</th>
             <th className="border px-2 py-2 text-left">Jugador</th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "pj" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               PJ
             </th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "goles" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               G
             </th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "x2" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               x2
             </th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "x3" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               x3
             </th>
             <th
               className={`border px-2 py-2 text-center w-16 ${ordenCampo === "prom" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               Prom
             </th>
           </tr>
         </thead>

         <tbody>
           {goleadoresOrdenados.map((g, idx) => {
             const a = g?.[ambito] || {};
             return (
               <tr
                 key={g.nombre}
                 className="odd:bg-white even:bg-slate-100/60 active:bg-slate-400/60 transition-colors"
               >
                 <td className="border px-2 py-2 text-center font-bold">
                   {idx + 1}
                 </td>
                 <td className="border px-2 py-2 text-left font-semibold">
                   <div
                     className="font-bold text-[14px] leading-tight truncate max-w-[180px]"
                     title={prettySafe(g.nombre)}
                   >
                     {prettySafe(g.nombre)}
                   </div>
                 </td>
                 {/* 🛠️ Pintamos las celdas de las columnas si coincide el campo activo */}
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "pj" ? campoHighlight : ""}`}
                 >
                   {a.pj ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "goles" ? campoHighlight : ""}`}
                 >
                   {a.goles ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "x2" ? campoHighlight : ""}`}
                 >
                   {a.x2 ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "x3" ? campoHighlight : ""}`}
                 >
                   {a.x3 ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "prom" ? campoHighlight : ""}`}
                 >
                   {formatProm(a.prom ?? 0)}
                 </td>
               </tr>
             );
           })}
           {goleadoresOrdenados.length > 0 && (
             <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
               <td className="border px-2 py-2 text-right" colSpan={2}>
                 TOTALES
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "pj" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalPJ}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "goles" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalGoles}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "x2" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalx2}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "x3" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalx3}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "prom" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.promProms}
               </td>
             </tr>
           )}
         </tbody>
       </table>
     </div>

     {/* 🖥️ VISTA ESCRITORIO (hidden sm:block) */}
     <div className="hidden sm:block max-h-[80vh] overflow-auto">
       <table className="table-fixed border-collapse mx-auto min-w-[520px] md:min-w-[620px] text-[11px] md:text-sm tabular-nums">
         <thead className="sticky top-0 z-20">
           <tr className="bg-slate-100 text-slate-700">
             <th className="border px-2 py-2 text-center sticky left-0 bg-slate-100 z-20 w-10">
               #
             </th>
             <th className="border px-2 py-2 text-left sticky left-10 bg-slate-100 z-20 w-40">
               Jugador
             </th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "pj" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               PJ
             </th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "goles" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               G
             </th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "x2" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               ⚽x2
             </th>
             <th
               className={`border px-2 py-2 text-center w-12 ${ordenCampo === "x3" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               ⚽x3
             </th>
             <th
               className={`border px-2 py-2 text-center w-16 ${ordenCampo === "prom" ? "bg-blue-100 text-blue-900" : ""}`}
             >
               P
             </th>
           </tr>
         </thead>

         <tbody>
           {goleadoresOrdenados.map((g, idx) => {
             const a = g?.[ambito] || {};
             return (
               <tr
                 key={g.nombre}
                 className="even:bg-slate-50 hover:bg-slate-100/70 transition-colors"
               >
                 <td className="border px-2 py-2 text-center sticky left-0 bg-white z-10 w-10">
                   {idx + 1}
                 </td>
                 <td className="border px-2 py-2 text-left font-semibold sticky left-10 bg-white z-10 w-40 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                   {prettySafe(g.nombre)}
                 </td>
                 {/* 🛠️ Pintamos las celdas de las columnas de escritorio si coincide el campo activo */}
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "pj" ? campoHighlight : ""}`}
                 >
                   {a.pj ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "goles" ? campoHighlight : ""}`}
                 >
                   {a.goles ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "x2" ? campoHighlight : ""}`}
                 >
                   {a.x2 ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "x3" ? campoHighlight : ""}`}
                 >
                   {a.x3 ?? 0}
                 </td>
                 <td
                   className={`border px-2 py-2 text-center ${ordenCampo === "prom" ? campoHighlight : ""}`}
                 >
                   {formatProm(a.prom ?? 0)}
                 </td>
               </tr>
             );
           })}
           {goleadoresOrdenados.length > 0 && (
             <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
               {/* 🛠️ CORRECCIÓN DE COLSPAN: Antes colSpan={3} hacía que los totales salgan corridos de lugar */}
               <td
                 className="border px-2 py-2 text-right sticky left-0 bg-slate-200 z-10"
                 colSpan={2}
               >
                 TOTALES
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "pj" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalPJ}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "goles" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalGoles}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "x2" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalx2}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "x3" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.totalx3}
               </td>
               <td
                 className={`border px-2 py-2 text-center ${ordenCampo === "prom" ? "bg-blue-100/80" : ""}`}
               >
                 {totals.promProms}
               </td>
             </tr>
           )}
         </tbody>
       </table>
     </div>

     <div className="mt-2 text-center text-xs text-slate-500">
       Vista: <span className="font-semibold">{tituloAmbito}</span>
     </div>
   </div>
 );
};

export default Gol_Tabla;

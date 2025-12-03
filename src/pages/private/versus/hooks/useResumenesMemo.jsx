// cspell: ignore Resumenes ambito
import React, { useMemo } from "react";

const toInt = (x) => (x == null ? 0 : parseInt(x, 10) || 0);
const emptyBox = () => ({ pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 });

const useResumenesMemo = (matches = []) => {
  return useMemo(() => {
    const res = {};
    for (const m of matches) {
      const rival =
        m?.rivalName || m?.rival || m?.opponent || "Rival Desconocido";
      const gf = toInt(
        m?.golesPropios ?? m?.golFavor ?? m?.golesFavor ?? m?.gf
      );
      const gc = toInt(
        m?.golesRival ?? m?.golContra ?? m?.golesContra ?? m?.gc
      );
      const ambito =
        (m?.condition === "local" && "local") ||
        (m?.condition === "visitante" && "visitante") ||
        "general";
      const captain = (m?.captain || "").trim();

      if (!res[rival]) {
        // cajas base
        res[rival] = {
          general: emptyBox(),
          local: emptyBox(),
          visitante: emptyBox(),
        };
        // y las dinámicas para capitanes (se crean on-demand abajo)
      }

      const resultado = gf > gc ? "g" : gf === gc ? "e" : "p";
      const actualizar = (box) => {
        box.pj++;
        box[resultado]++;
        box.gf += gf;
        box.gc += gc;
      };
      
      actualizar(res[rival].general);    
      if (ambito !== "general") {
        actualizar(res[rival][ambito]);
      }
      if (captain) {
        if (!res[rival][captain]) res[rival][captain] = emptyBox();
        actualizar(res[rival][captain]);
      }
    }
    return res;
  }, [matches]);
};

export default useResumenesMemo;

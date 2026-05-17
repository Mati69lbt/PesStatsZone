import React, { useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import { useRachasInvictas } from "../utils/UseRacahsInvictas";
import { formatearFecha } from "../utils/Hooks/formatearFechas";
import Invictos from "../utils/Rachas/Invictos";
import Ganados from "../utils/Rachas/Ganados";
import Empatados from "../utils/Rachas/Empatados";
import Perdidos from "../utils/Rachas/Perdidos";

const Rachas = () => {
  const [view, setView] = useState("invictos");
  return (
    <div>
      <div className="mt-3 grid grid-cols-2 md:flex md:justify-center gap-3 px-2 md:px-0">
        <button
          type="button"
          onClick={() => setView("invictos")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 active:scale-[0.98]",
            view === "invictos"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          Invictos
        </button>
        <button
          type="button"
          onClick={() => setView("ganados")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "ganados"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          Ganados
        </button>
        <button
          type="button"
          onClick={() => setView("empatados")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "empatados"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          Empatados
        </button>
        <button
          type="button"
          onClick={() => setView("perdidos")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "perdidos"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          Perdidos
        </button>
      </div>
      {view === "invictos" && <Invictos />}
      {view === "ganados" && <Ganados />}
      {view === "empatados" && <Empatados />}
      {view === "perdidos" && <Perdidos />}
    </div>
  );
};

export default Rachas;

import React, { useState } from "react";
import Favor from "../utils/Rachas/Favor";
import Contra from "../utils/Rachas/Contra";
import Valla from "../utils/Rachas/Valla";
import SinMarcar from "../utils/Rachas/SinMarcar";

const Gol = () => {
  const [view, setView] = useState("invictos");
  return (
    <div>
      <div className="mt-3 grid grid-cols-2 md:flex md:justify-center gap-3 px-2 md:px-0">
        <button
          type="button"
          onClick={() => setView("favor")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 active:scale-[0.98]",
            view === "favor"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          A Favor
        </button>
        <button
          type="button"
          onClick={() => setView("contra")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 active:scale-[0.98]",
            view === "contra"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          En Contra
        </button>
        <button
          type="button"
          onClick={() => setView("valla")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 active:scale-[0.98]",
            view === "valla"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          Valla Invicta
        </button>
        <button
          type="button"
          onClick={() => setView("sm")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 active:scale-[0.98]",
            view === "sm"
              ? "bg-sky-600 text-white border-sky-600 shadow-sky-100" // Activo: Celeste vibrante con texto blanco
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900", // Inactivo: Gris slate sutil
          ].join(" ")}
        >
          Sin Marcar
        </button>
      </div>
      {view === "favor" && <Favor />}
      {view === "contra" && <Contra />}
      {view === "valla" && <Valla />}
      {view === "sm" && <SinMarcar />}
    </div>
  );
};

export default Gol;

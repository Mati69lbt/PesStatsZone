import React, { useState } from "react";
import Palmares from "../../versus/palmares/page/Palmares";
import PersonRecord from "./PersonRecord";
import AllGoleadores from "./AllGoleadores";
import Calendario from "./Calendario";
import Rachas from "./Rachas";
import Gol from "./Gol";
import GolVersus from "./GolVersus";

const IndexPR = () => {
  const [view, setView] = useState("palmares");

  return (
    <div>
      {/* Contenedor de botones original */}
      <div className="mt-3 grid grid-cols-2 md:flex md:justify-center gap-3 px-2 md:px-0">
        <button
          type="button"
          onClick={() => setView("palmares")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "palmares"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          Palmares
        </button>

        <button
          type="button"
          onClick={() => setView("record")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "record"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          Record Personal
        </button>
        <button
          type="button"
          onClick={() => setView("rachas")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "rachas"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          Rachas
        </button>
        <button
          type="button"
          onClick={() => setView("gol")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "gol"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          Gol
        </button>
        <button
          type="button"
          onClick={() => setView("goleadores")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "goleadores"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          Goleadores
        </button>
        <button
          type="button"
          onClick={() => setView("versus")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "versus"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          Versus
        </button>
        <button
          type="button"
          onClick={() => setView("calendario")}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.98]",
            view === "calendario"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          Calendario
        </button>
      </div>
      <hr className="mt-2 border-slate-200 w-full" />

      {/* contenido abajo */}
      <div>
        {view === "palmares" && <Palmares />}
        {view === "record" && <PersonRecord />}
        {view === "rachas" && <Rachas />}
        {view === "gol" && <Gol />}
        {view === "goleadores" && <AllGoleadores />}
        {view === "calendario" && <Calendario />}
        {view === "versus" && <GolVersus />}
      </div>
    </div>
  );
};

export default IndexPR;

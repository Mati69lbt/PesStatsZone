import React, { useState } from "react";
import Palmares from "../../versus/palmares/page/Palmares";
import PersonRecord from "./PersonRecord";


const IndexPR = () => {
  const [view, setView] = useState("palmares");

  return (
    <div>
      <div className="mt-3 flex justify-center gap-3">
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
      </div>

      {/* contenido abajo */}
      <div className="mt-4">
        {view === "palmares" && <Palmares />}
        {view === "record" && <PersonRecord />}
      </div>
    </div>
  );
};

export default IndexPR;

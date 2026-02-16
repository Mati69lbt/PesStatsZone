import React from "react";
import {
  formatDDMM,
  getResultadoPartidoClasses,
  getGoleadoresPropiosTexto,
  getGoleadoresRivalesTexto,
} from "./utils";

const MatchCardMobile = ({ m, nroJuego, prettySafe, onEdit, onDelete }) => {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-start gap-2 px-3 py-2 bg-slate-100">
        <div>
          <div className="text-[10px] tabular-nums">{formatDDMM(m)}</div>
          <span className="text-slate-900 text-[10px]">
            {m.captain ? prettySafe(m.captain) : "—"}
          </span>
        </div>

        <div className="text-[12px] flex flex-col">
          <span className="text-slate-700 text-left pl-10">
            Fecha: {nroJuego}
          </span>

          <span
            className={
              "w-max px-2 py-0.5 rounded-full text-[12px] whitespace-nowrap " +
              getResultadoPartidoClasses(m.final)
            }
          >
            {prettySafe(m.resultMatch || "")}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer disabled:opacity-40"
            disabled={!m.id}
            title="Editar partido"
            onClick={() => onEdit(m)}
          >
            <img src="pencil.png" alt="Editar" className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(m)}
            className="cursor-pointer"
            title="Borrar partido"
          >
            <img src="bas.png" alt="Borrar" className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="px-3 py-2 text-[12px] bg-white">
        <div className="flex items-center justify-between px-1 text-[10px] uppercase tracking-wide text-slate-500">
          <span className="flex-1 text-center">Goles {m.club}</span>
          <span className="flex-1 text-center">Goles {m.rival}</span>
        </div>

        <div className="mt-1 flex items-start justify-between px-4">
          <span className="flex-1 text-center text-slate-800 break-words">
            {getGoleadoresPropiosTexto(m)}
          </span>

          <span className="flex-1 text-center text-slate-800 break-words">
            {getGoleadoresRivalesTexto(m)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchCardMobile;

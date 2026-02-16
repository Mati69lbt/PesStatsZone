import React from "react";
import {
  formatDDMM,
  getResultadoPartidoClasses,
  getGoleadoresPropiosTexto,
  getGoleadoresRivalesTexto,
} from "./utils";

const MatchRowDesktop = ({ m, prettySafe, onEdit, onDelete }) => {
  return (
    <tr
      key={m.id || `${m.fecha}-${m.rival}-${m.resultMatch}`}
      className="even:bg-slate-50"
    >
      <td className="border border-slate-200 px-2 py-2 text-center tabular-nums">
        {formatDDMM(m)}
      </td>

      <td className="border border-slate-200 px-2 py-2 text-left">
        <span
          className={
            "inline-block px-2 py-0.5 rounded-full text-[12px] whitespace-nowrap " +
            getResultadoPartidoClasses(m.final)
          }
        >
          {prettySafe(m.resultMatch || "")}
        </span>
      </td>

      <td className="border border-slate-200 px-2 py-2 text-center">
        <button
          type="button"
          className="cursor-pointer"
          disabled={!m.id}
          title="Editar partido"
          onClick={() => onEdit(m)}
        >
          <img src="pencil.png" alt="Editar" className="inline-block h-6 w-6" />
        </button>
      </td>

      <td className="border border-slate-200 px-2 py-2 text-left">
        {m.captain ? prettySafe(m.captain) : "—"}
      </td>

      <td className="border border-slate-200 px-2 py-2 text-left">
        {getGoleadoresPropiosTexto(m)}
      </td>

      <td className="border border-slate-200 px-2 py-2 text-left">
        {getGoleadoresRivalesTexto(m)}
      </td>

      <td className="border border-slate-200 px-2 py-2 text-center">
        <button
          type="button"
          onClick={() => onDelete(m)}
          className="inline-flex items-center justify-center cursor-pointer"
          title="Borrar partido"
        >
          <img src="bas.png" alt="Borrar" className="inline-block h-6 w-6" />
        </button>
      </td>
    </tr>
  );
};

export default MatchRowDesktop;

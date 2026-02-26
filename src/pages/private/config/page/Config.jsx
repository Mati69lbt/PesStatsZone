import React from "react";
import useAuth from "../../../../hooks/useAuth";
import { Link } from "react-router-dom";

const Config = () => {
  const { uid, user } = useAuth();



  return (
    <div className="p-2 max-w-4xl mx-auto mb-10">
      {/* Encabezado Minimalista */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">⚙️ Configuración</h1>
        <Link
          to="/campeonatos"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-all"
        >
          Volver
        </Link>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <b>UID:</b> {uid}
        </div>
        <div>
          <b>Email:</b> {user?.email || "-"}
        </div>
        <div>
          <b>Nombre:</b> {user?.displayName || "-"}
        </div>
      </div>
    </div>
  );
};

export default Config;

import React from "react";

const FechaInput = ({ value, onChange }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="relative mt-2">
        {" "}
        {/* mt-2 para que la etiqueta no quede pegada arriba */}
        {/* Etiqueta Flotante */}
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
          Fecha del Partido
        </label>
        <input
          type="date"
          name="fecha"
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm 
                 transition-all cursor-pointer hover:border-sky-200
                 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
        />
      </div>
    </div>
  );
};

export default FechaInput;

const ConditionInput = ({ value, onChange }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="relative mt-2">
        {/* Etiqueta Flotante - Consistente con Torneo, Fecha y Rival */}
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 z-10">
          ¿Dónde se jugó?
        </label>

        {/* Contenedor principal con el mismo estilo de borde que los inputs */}
        <div className="flex items-center gap-1 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <label
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg cursor-pointer transition-all ${
              value === "local"
                ? "bg-sky-500 text-white font-bold shadow-sm"
                : "text-slate-500 hover:bg-slate-50 font-semibold"
            }`}
          >
            <input
              type="radio"
              name="condition"
              value="local"
              checked={value === "local"}
              onChange={onChange}
              className="hidden" // Escondemos el radio original para usar el estilo de chip
            />
            <span className="text-sm">Local</span>
          </label>

          <label
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg cursor-pointer transition-all ${
              value === "visitante"
                ? "bg-sky-500 text-white font-bold shadow-sm"
                : "text-slate-500 hover:bg-slate-50 font-semibold"
            }`}
          >
            <input
              type="radio"
              name="condition"
              value="visitante"
              checked={value === "visitante"}
              onChange={onChange}
              className="hidden"
            />
            <span className="text-sm">Visitante</span>
          </label>

          <label
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg cursor-pointer transition-all ${
              value === "neutro"
                ? "bg-sky-500 text-white font-bold shadow-sm"
                : "text-slate-500 hover:bg-slate-50 font-semibold"
            }`}
          >
            <input
              type="radio"
              name="condition"
              value="neutro"
              checked={value === "neutro"}
              onChange={onChange}
              className="hidden"
            />
            <span className="text-sm">Neutral</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConditionInput;

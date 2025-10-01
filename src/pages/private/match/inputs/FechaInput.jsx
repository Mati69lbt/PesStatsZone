import React from "react";

const FechaInput = ({ value, onChange }) => {
  return (
    <div>
      <input
        type="date"
        name="fecha"
        value={value}
        onChange={onChange}
        className="w-full border rounded p-2"
      />
      <p className="text-xs text-gray-500">Fecha del Partido</p>
    </div>
  );
};

export default FechaInput;

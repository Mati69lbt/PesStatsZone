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
    </div>
  );
};

export default FechaInput;

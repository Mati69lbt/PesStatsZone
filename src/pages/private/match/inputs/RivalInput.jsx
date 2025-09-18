import React from "react";

const RivalInput = ({ value, onChange }) => {
  return (
    <div>
      <input
        type="text"
        name="rival"
        list="sugerencias-rivales"
        placeholder="Rival (nombre completo)"
        value={value}
        onChange={onChange}
        className="w-full border rounded p-2"
      />
    </div>
  );
};

export default RivalInput;

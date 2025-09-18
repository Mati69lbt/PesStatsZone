import React from "react";

const GuardarPartidoButton = ({ disabled, onClick }) => {
  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        className="bg-green-500 text-white rounded w-full p-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onClick}
      >
        Guardar
      </button>
    </div>
  );
};

export default GuardarPartidoButton;

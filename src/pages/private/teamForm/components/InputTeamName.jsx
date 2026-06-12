//cspell: ignore Notiflix notiflix
import React from "react";
import { pretty } from "../../match/utils/pretty";

const InputTeamName = ({
  value,
  onChange,
  onBlurSave,
  onConfirm,
  suggestions = [],
  disabled,
}) => {
  return (
    <div>
      <label htmlFor="teamName">Nombre del Equipo</label>
      <div className="flex flex-row gap-2">
        <input
          type="text"
          id="teamName"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlurSave}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirm();
            }
          }}
          className="w-full p-2 border rounded"
          list="club-suggestions"
          placeholder="Ej.: Newell's, Talleres CBA, Instituto…"
        />

        <datalist id="club-suggestions">
          {(suggestions || []).map(({ key, label }) => (
            <option key={key} value={pretty(label)} />
          ))}
        </datalist>

        <button
          type="button"
          className="bg-blue-500 text-white rounded px-3"
          onClick={onConfirm}
        >
          Guardar Equipo
        </button>
      </div>
    </div>
  );
};

export default InputTeamName;

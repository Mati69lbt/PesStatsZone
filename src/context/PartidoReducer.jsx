// cspell: ignore FORMACION
import React, { createContext, useContext, useReducer } from "react";
export const matchInitialState = {
  fecha: "2018-07-01",
  bootstrapped: true,
  rival: "",
  activeClub: "",
  torneoName: "",
  torneoYear: null,
  torneoDisplay: "",
  condition: "",
  torneosIndex: [],
  matches: [],
  rivalesIndex: [],
  captain: "",
  starters: [],
  substitutes: [],
};

export function partidoReducer(state, action) {
  switch (action.type) {
    case "ACTUALIZAR_CAMPO":
      return {
        ...state,
        [action.campo]: action.valor,
      };
    case "SET_FECHA": {
      const value = action.payload;
      if (typeof value !== "string" || value.trim() === "") return state;
      return { ...state, fecha: value, bootstrapped: true };
    }
    case "SET_RIVAL": {
      const value = action.payload;
      if (typeof value !== "string" || value.trim() === "") return state;
      return { ...state, rival: value };
    }
    case "HYDRATE_FROM_FIREBASE": {
      const data = action.payload || {};
      return {
        ...state,
        activeClub: data.activeClub ?? state.activeClub,
        torneosIndex: Array.isArray(data.torneosIndex) ? data.torneosIndex : [],
        matches: Array.isArray(data.matches) ? data.matches : [],
        rivalesIndex: Array.isArray(data.rivalesIndex) ? data.rivalesIndex : [],
      };
    }
    case "SET_FORMACION": {
      const { captain, starters } = action.payload;
      return {
        ...state,
        captain,
        starters,
      };
    }
    case "SET_SUBS":
      const { substitutes } = action.payload;
      return {
        ...state,
        substitutes,
      };
    case "RESET_FORM":
      return {
        ...matchInitialState,
        activeClub: state.activeClub,
        torneosIndex: state.torneosIndex,
        matches: state.matches,
        rivalesIndex: state.rivalesIndex,
      };

    default:
      return state;
  }
}
const PartidoContext = createContext(null);

export function usePartido() {
  const ctx = useContext(PartidoContext);
  if (!ctx)
    throw new Error("usePartido debe usarse dentro de <PartidoProvider>");
  return ctx;
}

export function PartidoProvider({ children }) {
  const [state, dispatch] = useReducer(partidoReducer, matchInitialState);
  const value = React.useMemo(() => ({ state, dispatch }), [state]);
  return (
    <PartidoContext.Provider value={value}>{children}</PartidoContext.Provider>
  );
}

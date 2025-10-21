// cspell: ignore FORMACION hattrick autogolesFavor
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
  goleadoresActiveClub: [],
  goleadoresRivales: [],
  autogolesFavor: 0,
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
        matches: Array.isArray(data.matches) ? data.matches : state.matches,
        rivalesIndex: Array.isArray(data.rivalesIndex) ? data.rivalesIndex : [],
        goleadoresActiveClub: Array.isArray(data.goleadoresActiveClub)
          ? data.goleadoresActiveClub
          : state.goleadoresActiveClub,
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
    case "ADD_GOLEADOR": {
      const { name, activeClub } = action.payload;
      const exists = state.goleadoresActiveClub.some(
        (g) => g.name === name && g.activeClub === activeClub
      );
      if (exists) return state;
      return {
        ...state,
        goleadoresActiveClub: [
          ...state.goleadoresActiveClub,
          {
            name,
            activeClub,
            gol: !!action.payload.gol,
            doblete: !!action.payload.doblete,
            triplete: !!action.payload.triplete,
            hattrick: !!action.payload.hattrick,
            expulsion: !!action.payload.expulsion,
            isOwnGoal: !!action.payload.isOwnGoal,
          },
        ],
      };
    }

    case "TOGGLE_EVENT": {
      const { name, activeClub, event } = action.payload;
      return {
        ...state,
        goleadoresActiveClub: state.goleadoresActiveClub.map((g) =>
          g.name === name && g.activeClub === activeClub
            ? { ...g, [event]: !g[event] }
            : g
        ),
      };
    }
    case "REMOVE_GOLEADOR": {
      const { name, activeClub } = action.payload;
      return {
        ...state,
        goleadoresActiveClub: state.goleadoresActiveClub.filter(
          (g) => !(g.name === name && g.activeClub === activeClub)
        ),
      };
    }
    case "RESET_FORM":
      return {
        ...matchInitialState,
        activeClub: state.activeClub,
        torneosIndex: state.torneosIndex,
        matches: state.matches,
        rivalesIndex: state.rivalesIndex,
      };

    case "OWN_GOAL_FAVOR_INC":
      return { ...state, autogolesFavor: (state.autogolesFavor || 0) + 1 };

    case "OWN_GOAL_FAVOR_DEC":
      return {
        ...state,
        autogolesFavor: Math.max(0, (state.autogolesFavor || 0) - 1),
      };

    case "RIVAL_ADD": {
      const p = action.payload; // {name, club, gol, doblete, triplete, expulsion}
      const exists = state.goleadoresRivales.some(
        (g) => g.name === p.name && g.club === p.club
      );
      if (exists) return state;
      return { ...state, goleadoresRivales: [...state.goleadoresRivales, p] };
    }

    case "RIVAL_TOGGLE": {
      const { name, club, field } = action.payload;
      return {
        ...state,
        goleadoresRivales: state.goleadoresRivales.map((g) =>
          g.name === name && g.club === club ? { ...g, [field]: !g[field] } : g
        ),
      };
    }

    case "RIVAL_REMOVE": {
      const { name, club } = action.payload;
      return {
        ...state,
        goleadoresRivales: state.goleadoresRivales.filter(
          (g) => !(g.name === name && g.club === club)
        ),
      };
    }

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

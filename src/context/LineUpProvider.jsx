import React, { createContext, useReducer, useContext } from "react";
import { normalizeName } from "../utils/normalizeName";

export const LINEUP_RESET = "LINEUP_RESET";
export const LINEUP_SET_SELECTED = "LINEUP_SET_SELECTED";
export const LINEUP_SET_CAPTAIN = "LINEUP_SET_CAPTAIN";
export const LINEUP_ADD_STARTER = "LINEUP_ADD_STARTER";
export const LINEUP_REMOVE_STARTER = "LINEUP_REMOVE_STARTER";
export const LINEUP_SAVE_LOCAL = "LINEUP_SAVE_LOCAL";
export const CLUB_SET_ACTIVE = "CLUB_SET_ACTIVE";
export const CLUB_RESET = "CLUB_RESET";
export const PLAYERS_ADD = "PLAYERS_ADD";
export const PLAYERS_REMOVE = "PLAYERS_REMOVE";
export const PLAYERS_RESET = "PLAYERS_RESET";
export const LINEUP_DELETE_LOCAL = "LINEUP_DELETE_LOCAL";
export const SAVE_CLUB_NAME = "SAVE_CLUB_NAME";
export const CLUB_LOAD_FROM_ACTIVE = "CLUB_LOAD_FROM_ACTIVE";
export const LINEUPS_UPSERT_BUCKET = "LINEUPS_UPSERT_BUCKET";

export const lineupInitialState = {
  captainName: null,
  starters: [],
  selectMode: "captain",
  selectedOption: "",
  lineups: {},
  activeClub: "",
  players: [],
  usedClub: false,
  managedClubs: [],
};

export const LineupsContext = createContext();
export function useLineups() {
  const ctx = useContext(LineupsContext);
  if (!ctx)
    throw new Error("useLineups debe usarse dentro de <LineupsProvider>");
  return ctx; // { state, dispatch }
}

export function lineupReducer(state, action) {
  switch (action.type) {
    case CLUB_RESET: {
      return {
        activeClub: "",
        players: [],
        lineups: {},
      };
    }
    case LINEUP_RESET: {
      return {
        ...state,
        captainName: null,
        starters: [],
        selectMode: "captain",
        selectedOption: "",
      };
    }
    case LINEUP_SET_SELECTED: {
      return { ...state, selectedOption: action.payload };
    }
    case LINEUP_SET_CAPTAIN: {
      if (!action.payload || typeof action.payload.captain !== "string")
        return state;
      const captain = normalizeName(action.payload.captain);
      if (
        captain === "" ||
        (state.starters.length >= 11 && !state.starters.includes(captain))
      ) {
        return state;
      }
      const starters = state.starters.includes(captain)
        ? state.starters
        : [...state.starters, captain];
      return {
        ...state,
        captainName: captain,
        starters,
        selectMode: "starters",
        selectedOption: "",
      };
    }
    case LINEUP_SAVE_LOCAL: {
      const club = normalizeName(state.activeClub ?? "");
      if (!club) return state;

      const prevBucket = state.lineups?.[club];
      const baseBucket = prevBucket ?? {
        label: club,
        players: [],
        formations: [],
      };

      if (!action.payload) return state;

      const { id, captain, starters, createdAt } = action.payload;

      const cap = normalizeName(captain);

      const st = Array.isArray(starters) ? starters.map(normalizeName) : [];
      const validDate =
        createdAt && !Number.isNaN(new Date(createdAt).getTime());

      if (!id || st.length !== 11 || !cap || !validDate || !st.includes(cap)) {
        return state; //
      }

      const nextPlayers = Array.isArray(baseBucket.players)
        ? [...baseBucket.players]
        : [];

      const exists = baseBucket.formations.some((f) => f.id === id);
      if (exists) return state;

      const createdAtISO = new Date(createdAt).toISOString();
      const newFormation = {
        id,
        createdAt: createdAtISO,
        captain: cap,
        starters: [...st],
      };

      const nextBucket = {
        label: baseBucket.label || club,
        players: nextPlayers,
        formations: [newFormation, ...baseBucket.formations],
      };

      return {
        ...state,
        lineups: {
          ...state.lineups,
          [club]: nextBucket,
        },
        captainName: null,
        starters: [],
        selectMode: "captain",
        selectedOption: "",
      };
    }
    case LINEUP_ADD_STARTER: {
      if (!action.payload || typeof action.payload.player !== "string")
        return state;
      const player = normalizeName(action.payload.player);
      if (
        player === "" ||
        state.starters.length >= 11 ||
        state.starters.includes(player)
      ) {
        return state;
      }
      return {
        ...state,
        starters: [...state.starters, player],
        selectMode: "starters",
        selectedOption: "",
      };
    }
    case LINEUP_REMOVE_STARTER: {
      if (!action.payload || typeof action.payload.player !== "string")
        return state;
      const player = normalizeName(action.payload.player);
      if (player === "" || !state.starters.includes(player)) return state;
      const newStarters = state.starters.filter((p) => p !== player);
      const isRemovingCaptain = player === state.captainName;
      return {
        ...state,
        captainName: isRemovingCaptain ? null : state.captainName,
        starters: newStarters,
        selectMode: isRemovingCaptain ? "captain" : state.selectMode,
        selectedOption: "",
      };
    }
    case LINEUP_DELETE_LOCAL: {
      if (!action.payload || typeof action.payload.id !== "string")
        return state;
      const club = normalizeName(state.activeClub ?? "");

      if (!club) return state;

      const bucket = state.lineups?.[club];
      if (!bucket) return state;

      const before = bucket.formations.length;
      const formations = bucket.formations.filter(
        (f) => f.id !== action.payload.id
      );
      if (formations.length === before) return state;

      return {
        ...state,
        lineups: {
          ...state.lineups,
          [club]: { ...bucket, formations },
        },
      };
    }

    case "SET_MANAGED_CLUBS": {
      const seen = new Set();
      const list = (action.payload?.clubs || [])
        .map((k) => normalizeName(k))
        .filter((k) => k && !seen.has(k) && seen.add(k));
      return { ...state, managedClubs: list };
    }

    case PLAYERS_ADD: {
      if (!action.payload || typeof action.payload.name !== "string")
        return state;
      const name = normalizeName(action.payload.name);
      if (name === "") return state;
      const club = normalizeName(state.activeClub ?? "");
      if (!club) return state;
      const prevBucket = state.lineups?.[club] ?? {
        label: club,
        players: [],
        formations: [],
      };
      const curr = Array.isArray(prevBucket.players) ? prevBucket.players : [];
      if (curr.includes(name)) return state;
      const nextPlayers = [...curr, name].sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" })
      );
      return {
        ...state,
        lineups: {
          ...state.lineups,
          [club]: { ...prevBucket, players: nextPlayers },
        },
        // espejo para compatibilidad (solo del club activo)
        players: nextPlayers,
      };
    }
    case PLAYERS_REMOVE: {
      const raw = action.payload?.name ?? "";
      const needle = normalizeName(raw);
      if (!needle) return state;

      const updatedPlayers = state.players.filter((p) => p !== needle);
      const updatedStarters = state.starters.filter((p) => p !== needle);

      const captainRemoved = normalizeName(state.captainName) === needle;

      const club = normalizeName(state.activeClub ?? "");

      const bucket = club ? state.lineups?.[club] : null;

      let nextLineups = state.lineups;
      if (bucket) {
        const bucketPlayers = bucket.players.filter((p) => p !== needle);

        const bucketFormations = bucket.formations.filter((f) => {
          const isCaptain = normalizeName(f.captain) === needle;
          const isStarter =
            Array.isArray(f.starters) && f.starters.some((s) => s === needle);
          return !(isCaptain || isStarter);
        });

        nextLineups = {
          ...state.lineups,
          [club]: {
            ...bucket,
            players: bucketPlayers,
            formations: bucketFormations,
          },
        };
      }
      return {
        ...state,
        players: updatedPlayers,
        starters: updatedStarters,
        captainName: captainRemoved ? null : state.captainName,
        selectMode: captainRemoved ? "captain" : state.selectMode,
        lineups: nextLineups,
      };
    }
    case SAVE_CLUB_NAME: {
      if (!action.payload || typeof action.payload.name !== "string")
        return state;
      const club = normalizeName(action.payload.name);
      if (club === "") return state;
      const set = new Set([...(state.managedClubs || []), club]);
      return { ...state, activeClub: club, managedClubs: Array.from(set) };
    }
    case CLUB_LOAD_FROM_ACTIVE: {
      const club = normalizeName(state.activeClub || "");

      const bucket = state.lineups?.[club];

      if (!bucket) {
        return {
          ...state,
          usedClub: false,
          captainName: null,
          starters: [],
          selectMode: "captain",
          selectedOption: "",
          players: [],
        };
      } else {
        return {
          ...state,
          players: bucket.players,
          usedClub: true,
        };
      }
    }
    case LINEUPS_UPSERT_BUCKET: {
      const { club, bucket } = action.payload || {};
      
      // al inicio del case
      console.log(
        "[REDUCER][LINEUPS_UPSERT_BUCKET] club:",
        club,
        "bucket keys:",
        Object.keys(bucket || {})
      );

      if (!club || !bucket) return state;

      const prev = state.lineups?.[club] ?? {};
      const nextBucket = { ...prev, ...bucket }; // ← hidrata TODO lo que venga (matches, playersStats, rivals..., etc.)

      const active = normalizeName(state.activeClub ?? "");
      const clubNorm = normalizeName(club);

      return {
        ...state,
        lineups: {
          ...state.lineups,
          [club]: nextBucket, // una sola asignación
        },
        // espejo del club activo (opcional, como ya tenías)
        ...(clubNorm === active && nextBucket.players
          ? { players: nextBucket.players }
          : null),
      };
    }

    default:
      return state;
  }
}

export function LineupsProvider({ children }) {
  const [state, dispatch] = useReducer(lineupReducer, lineupInitialState);
  return (
    <LineupsContext.Provider value={{ state, dispatch }}>
      {children}
    </LineupsContext.Provider>
  );
}

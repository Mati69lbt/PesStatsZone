// cspell: ignore funtions
import React, { useMemo, useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { usePartido } from "../../../../../context/PartidoReducer";
import { useLineups } from "../../../../../context/LineUpProvider";
import { useUserData } from "../../../../../hooks/useUserData";
import { Navigate } from "react-router-dom";
import {
  BuildClubs,
  getMatchSeason,
  getMatchYear,
  SORT_FIELDS_CLUBS,
} from "../utils/BuildClubs";
import ClubsTable from "../utils/ClubsTable";

const TABS = ["General", "Local", "Visitante", "Neutral"];

const Clubs = () => {
  const { uid } = useAuth();
  const { state: matchState, dispatch: matchDispatch } = usePartido();
  const { state: lineupState, dispatch: lineupDispatch } = useLineups();

  useUserData(uid, matchDispatch, lineupDispatch);

  const [openTab, setOpenTab] = useState("General");
  const [sortField, setSortField] = useState("pj");
  const [sortDir, setSortDir] = useState("desc");
  const [modo, setModo] = useState("anual"); // "anual" | "europeo"

  const clubs = Object.keys(lineupState?.lineups || {});
  const hasData = clubs.length > 0;

  const allMatches = useMemo(() => {
    return Object.values(lineupState?.lineups || {}).flatMap((club) =>
      Array.isArray(club.matches) ? club.matches : [],
    );
  }, [lineupState]);

  const getPeriodo = modo === "europeo" ? getMatchSeason : getMatchYear;

  const items = useMemo(
    () => BuildClubs(allMatches, getPeriodo),
    [allMatches, modo],
  );

  if (!hasData) return <Navigate to="/formacion" replace />;

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="p-2 w-max mx-auto">
      {/* Header */}
      <div className="flex items-center justify-evenly gap-2 mb-3 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex flex-col gap-0 leading-none">
          <span>🏟️ Clubes</span>
          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {items.length} entrada{items.length !== 1 ? "s" : ""}
          </span>
        </h1>

        {/* Toggle Anual / Europeo */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setModo("anual")}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-[0.1em] transition-all border ${
              modo === "anual"
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
            }`}
          >
            Anual
          </button>
          <button
            type="button"
            onClick={() => setModo("europeo")}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-[0.1em] transition-all border ${
              modo === "europeo"
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
            }`}
          >
            Europeo
          </button>
        </div>
      </div>

      {/* Botones de ordenamiento */}
      <div className="flex flex-wrap gap-1 px-4 py-2 mb-2 rounded-xl border border-slate-200 bg-slate-50">
        {SORT_FIELDS_CLUBS.map((f) => {
          const isActive = sortField === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => handleSort(f.key)}
              className={`px-2 py-1 rounded-lg text-[14px] font-bold border transition-colors
                ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
            >
              {f.label} {isActive ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
          );
        })}
      </div>

      {/* 4 acordeones */}
      <div className="space-y-1">
        {TABS.map((tab) => (
          <ClubsTable
            key={tab}
            title={tab}
            list={items}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            isOpen={openTab === tab}
            onToggle={() => setOpenTab(openTab === tab ? null : tab)}
          />
        ))}
      </div>
    </div>
  );
};

export default Clubs;

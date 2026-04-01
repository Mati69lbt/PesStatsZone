import React, { useMemo, useState } from "react";
import { useLineups } from "../../../../context/LineUpProvider";
import {
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Trophy,
} from "lucide-react";
import { pretty } from "../../match/utils/pretty";

const Calendario = () => {
  const { state: lineupState } = useLineups();
  const [openMonth, setOpenMonth] = useState(null);
  const [openDay, setOpenDay] = useState(null);

  // 1. Agrupamos los partidos.
  // IMPORTANTE: La llave será "MM-DD" para agrupar por día/mes sin importar el año
  const matchesByDayMonth = useMemo(() => {
    const lineups = lineupState?.lineups ?? {};
    const map = {};

    Object.entries(lineups).forEach(([clubKey, bucket]) => {
      const label = bucket?.label ?? clubKey;
      const matches = Array.isArray(bucket?.matches) ? bucket.matches : [];

      console.log("matches", matches);

      matches.forEach((m) => {
        if (!m.fecha) return;
        // Extraemos mes y día de "YYYY-MM-DD"
        const [_, mm, dd] = m.fecha.split("-");
        const key = `${mm}-${dd}`; // Llave única por día del calendario

        if (!map[key]) map[key] = [];
        map[key].push({
          ...m,
          __clubLabel: label,
        });
      });
    });
    return map;
  }, [lineupState]);

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const getStatusColor = (final) => {
    const f = final?.toLowerCase();
    if (f === "ganado") return "border-l-4 border-green-500 bg-green-50/30";
    if (f === "perdido") return "border-l-4 border-red-500 bg-red-50/30";
    if (f === "empatado") return "border-l-4 border-yellow-500 bg-yellow-50/30";
    return "border-l-4 border-slate-300 bg-slate-50";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6 px-2">
        <CalendarIcon className="text-slate-900" size={24} />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
          Calendario
        </h2>
      </div>

      <div className="space-y-3">
        {meses.map((mes, mIdx) => {
          const isOpen = openMonth === mIdx;
          const mesStr = String(mIdx + 1).padStart(2, "0");

          // Obtenemos todas las llaves que pertenecen a este mes (ej: "01-17", "01-20")
          const daysInMonthKeys = Object.keys(matchesByDayMonth)
            .filter((key) => key.startsWith(mesStr))
            .sort();

          const totalPartidosMes = daysInMonthKeys.reduce(
            (acc, key) => acc + matchesByDayMonth[key].length,
            0,
          );

          if (totalPartidosMes === 0) return null; // Opcional: ocultar meses vacíos

          return (
            <div
              key={mes}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenMonth(isOpen ? null : mIdx)}
                className={`w-full flex items-center justify-between p-4 transition-all ${
                  isOpen
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold uppercase tracking-widest text-sm">
                    {mes}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isOpen ? "bg-white/20" : "bg-slate-100"}`}
                  >
                    {totalPartidosMes}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {isOpen && (
                <div className="p-2 bg-slate-50 space-y-1">
                  {daysInMonthKeys.map((dayKey) => {
                    const dia = dayKey.split("-")[1];
                    const partidosDia = matchesByDayMonth[dayKey];
                    const isDayOpen = openDay === dayKey;

                    return (
                      <div
                        key={dayKey}
                        className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => setOpenDay(isDayOpen ? null : dayKey)}
                          className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-slate-400 w-6 text-center">
                              {parseInt(dia)}
                            </span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                              {partidosDia.length}{" "}
                              {partidosDia.length === 1
                                ? "Partido"
                                : "Partidos"}
                            </span>
                          </div>
                          {isDayOpen ? (
                            <ChevronDown size={14} className="text-slate-300" />
                          ) : (
                            <ChevronRight
                              size={14}
                              className="text-slate-300"
                            />
                          )}
                        </button>

                        {isDayOpen && (
                          <div className="p-2 bg-slate-50 border-t border-slate-100 space-y-2">
                            {partidosDia
                              .sort((a, b) => b.fecha.localeCompare(a.fecha))
                              .map((match, idx) => (
                                <div
                                  key={`${match.fecha}-${idx}`}
                                  className={`flex items-center justify-between p-2 rounded-lg shadow-sm border ${getStatusColor(match.final)}`}
                                >
                                  <div className="flex flex-col gap-0.5 overflow-hidden">
                                    {/* Renglón 1: Club y Condición */}
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-slate-800 text-[11px] uppercase truncate">
                                        {match.__clubLabel}
                                      </span>
                                      <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 rounded uppercase">
                                        {match.condition}
                                      </span>
                                    </div>

                                    {/* Renglón 2: Torneo y Capitán */}
                                    <div className="flex items-center gap-2 text-[9px] text-slate-500 font-medium truncate">
                                      <span className="flex items-center gap-0.5">
                                        <Trophy size={10} /> {match.torneoName}{" "}
                                        ({match.torneoYear})
                                      </span>
                                      <span className="flex items-center gap-0.5">
                                        <User size={10} />{" "}
                                        {pretty(match.captain)}
                                      </span>
                                    </div>

                                    {/* NUEVO Renglón 3: Goleadores del Club */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-blue-600 font-bold mt-0.5">
                                      {match.goleadoresActiveClub &&
                                      match.goleadoresActiveClub.length > 0 ? (
                                        match.goleadoresActiveClub.map(
                                          (gol, gIdx) => {
                                            // Usamos la lógica de cálculo de goles (1 para gol, 2 doblete, 3 triplete, etc)
                                            const cantidadGoles = (gol) => {
                                              const t = !!(
                                                gol.triplete || gol.hattrick
                                              );
                                              if (t && gol.doblete && gol.gol)
                                                return 6;
                                              if (t && gol.doblete) return 5;
                                              if (t && gol.gol) return 4;
                                              if (t) return 3;
                                              if (gol.doblete) return 2;
                                              if (gol.gol) return 1;
                                              return 0;
                                            };

                                            const total = cantidadGoles(gol);
                                            if (total === 0) return null;

                                            return (
                                              <span
                                                key={gIdx}
                                                className="bg-blue-50 px-1 rounded flex items-center gap-0.5"
                                              >
                                                {pretty(gol.name)}
                                                <span className="text-slate-400 text-[8px]">
                                                  ({total})
                                                </span>
                                              </span>
                                            );
                                          },
                                        )
                                      ) : (
                                        <span className="text-slate-300 italic font-normal">
                                          Sin goles
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end shrink-0 ml-2">
                                    <div className="flex items-center gap-1">
                                      <div className="bg-slate-900 text-white text-[12px] font-black px-2 py-0.5 rounded tabular-nums">
                                        {match.condition === "local" ||
                                        match.condition === "neutro"
                                          ? `${match.golFavor} - ${match.golContra}`
                                          : `${match.golContra} - ${match.golFavor}`}
                                      </div>
                                      <div className="text-[8px] font-black uppercase px-1 border border-slate-900 rounded bg-white">
                                        {match.final}
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 italic mt-0.5">
                                      {match.rival}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendario;

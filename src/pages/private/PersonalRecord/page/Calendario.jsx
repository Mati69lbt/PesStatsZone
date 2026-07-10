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
    <div className="w-full max-w-max min-w-full mx-auto p-2">
      <div className="flex items-center gap-3 mb-2 px-2">
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

          const statsMes = daysInMonthKeys.reduce(
            (acc, key) => {
              matchesByDayMonth[key].forEach((m) => {
                const res = m.final?.toLowerCase();
                if (res === "ganado") acc.g++;
                else if (res === "empatado") acc.e++;
                else if (res === "perdido") acc.p++;
                acc.total++;
              });
              return acc;
            },
            { total: 0, g: 0, e: 0, p: 0 },
          );

          if (statsMes.total === 0) return null;

          return (
            <div
              key={mes}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenMonth(isOpen ? null : mIdx)}
                className={`w-full flex items-center justify-between p-3 transition-all ${
                  isOpen
                    ? "bg-slate-700 text-white"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="grid grid-cols-[7rem_1fr] items-center w-full">
                  {/* 20%: mes */}

                  <span className="font-bold uppercase tracking-widest text-sm mx-2">
                    {mes}
                  </span>

                  {/* 80%: 4 columnas fijas para PJ G E P */}
                  <div className="grid grid-cols-4 items-center ">
                    <span
                      className={`text-[12px] px-0.5 py-0.5 rounded-md font-black tracking-wider justify-self-center ${
                        isOpen
                          ? "bg-white/10 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      PJ: {statsMes.total}
                    </span>
                    <span
                      className={`text-[12px] px-0.5 py-0.5 rounded-md font-black justify-self-center ${
                        isOpen
                          ? "bg-green-500/80 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      G: {statsMes.g}
                    </span>
                    <span
                      className={`text-[12px] px-0.5 py-0.5 rounded-md font-black justify-self-center ${
                        isOpen
                          ? "bg-amber-400/80 text-black"
                          : "bg-amber-400 text-black"
                      }`}
                    >
                      E: {statsMes.e}
                    </span>
                    <span
                      className={`text-[12px] px-0.5 py-0.5 rounded-md font-black justify-self-center ${
                        isOpen
                          ? "bg-rose-600/80 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      P: {statsMes.p}
                    </span>
                  </div>
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
                    const isDayOpen = openDay === dayKey;
                    const [_, dd] = dayKey.split("-");

                    // 1. PRIMERO DECLARAMOS TU VARIABLE ORIGINAL (Asegurando que sea un Array siempre)
                    const partidosDia = matchesByDayMonth[dayKey] || [];

                    // 2. RECIÉN AHÍ CALCULAMOS LAS ESTADÍSTICAS CON UN SEGURITO EXTRA
                    const statsDia = partidosDia.reduce(
                      (acc, m) => {
                        const res = m?.final?.toLowerCase()?.trim();
                        if (res === "ganado") acc.g++;
                        else if (res === "empatado") acc.e++;
                        else if (res === "perdido") acc.p++;
                        acc.total++;
                        return acc;
                      },
                      { total: 0, g: 0, e: 0, p: 0 },
                    );

                    return (
                      <div
                        key={dayKey}
                        className="border-b border-slate-500 last:border-0"
                      >
                        <button
                          onClick={() => setOpenDay(isDayOpen ? null : dayKey)}
                          className={`w-full flex items-center justify-between p-2 transition-all ${
                            isDayOpen
                              ? "bg-slate-700 text-white shadow-inner"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {/* TABLA igual que meses: alinea badges en columna entre filas */}
                          <div className="grid grid-cols-[7rem_1fr] items-center w-full">
                            <span
                              className={`text-xs font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0 ${
                                isDayOpen ? "text-white" : "text-slate-700"
                              }`}
                            >
                              {dd} / {mes}
                            </span>

                            <div className="grid grid-cols-4 items-center gap-1.5">
                              <span
                                className={`text-[12px] px-0.5 py-0.5 rounded font-bold tracking-wide ${
                                  isDayOpen
                                    ? "bg-white/10 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                PJ: {statsDia.total}
                              </span>

                              <span
                                className={`text-[11px] px-1.0.5 py-0.5 rounded font-black ${
                                  statsDia.g === 0
                                    ? isDayOpen
                                      ? "text-slate-400"
                                      : "text-slate-300"
                                    : "bg-green-500 text-white"
                                }`}
                              >
                                G: {statsDia.g === 0 ? "-" : statsDia.g}
                              </span>

                              <span
                                className={`text-[12px] px-0.5 py-0.5 rounded font-black ${
                                  statsDia.e === 0
                                    ? isDayOpen
                                      ? "text-slate-400"
                                      : "text-slate-300"
                                    : "bg-amber-400 text-black"
                                }`}
                              >
                                E: {statsDia.e === 0 ? "-" : statsDia.e}
                              </span>

                              <span
                                className={`text-[12px] px-0.5 py-0.5 rounded font-black ${
                                  statsDia.p === 0
                                    ? isDayOpen
                                      ? "text-slate-400"
                                      : "text-slate-300"
                                    : "bg-rose-600 text-white"
                                }`}
                              >
                                P: {statsDia.p === 0 ? "-" : statsDia.p}
                              </span>
                            </div>
                          </div>

                          {/* Flecha del acordeón alineada a la derecha de todo */}
                          <div
                            className={`flex-shrink-0 ml-4 ${isDayOpen ? "text-white" : "text-slate-400"}`}
                          >
                            {isDayOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </div>
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
                                      <span className="text-[12px] font-bold bg-slate-200 text-slate-600 px-1.5 rounded uppercase">
                                        {match.condition}
                                      </span>
                                    </div>

                                    {/* Renglón 2: Torneo y Capitán */}
                                    <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium truncate">
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
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-blue-600 font-bold mt-0.5">
                                      {match.goleadoresActiveClub &&
                                      match.goleadoresActiveClub.length > 0 ? (
                                        match.goleadoresActiveClub.map(
                                          (gol, gIdx) => {
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
                                    <div className="flex items-center gap-1.5">
                                      <div
                                        className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                          match.final === "ganado"
                                            ? "border-green-200 text-green-600 bg-green-50"
                                            : match.final === "perdido"
                                              ? "border-red-200 text-red-600 bg-red-50"
                                              : "border-slate-200 text-slate-500 bg-slate-50"
                                        }`}
                                      >
                                        {match.final}
                                      </div>

                                      <div className="bg-slate-100/80 text-slate-900 text-[13px] font-black px-2.5 py-0.5 rounded-full tabular-nums border border-slate-200">
                                        {match.condition === "local" ||
                                        match.condition === "neutro"
                                          ? `${match.golFavor} - ${match.golContra}`
                                          : `${match.golContra} - ${match.golFavor}`}
                                      </div>
                                    </div>

                                    <span className="text-[12px] font-bold text-slate-400 italic mt-1 uppercase tracking-tight">
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

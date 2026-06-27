// cspell: ignore funtions Estadisticas Historica nums
import React, { useState } from "react";
import { prettySafe } from "../../campeonatos/util/funtions";
import {
  useListaHistorica,
  useListaHistoricaLocal,
  useListaHistoricaVisitante,
  useListaMasPJ,
  useListaMasPJLocal,
  useListaMasPJVisitante,
  useListaMejorPromedio,
  useListaMejorPromedioLocal,
  useListaMejorPromedioVisitante,
  useResumenPorAño,
} from "../utils/EstadisticasAnuales/useMemoGoalsMaps";
import { buildListFromMap } from "../utils/EstadisticasAnuales/estAnuales";
import { TablaHistorica } from "../utils/EstadisticasAnuales/TablaAnual";
import { RenderBloque } from "../utils/EstadisticasAnuales/RenderBloque";
import { RenderBloqueAnios } from "../utils/EstadisticasAnuales/RenderBloqueAnios";

const rankStyles = (index) => {
  if (index === 0) return { bg: "bg-amber-50", icon: "🥇", isTop3: true };
  if (index === 1) return { bg: "bg-slate-50", icon: "🥈", isTop3: true };
  if (index === 2) return { bg: "bg-orange-50/40", icon: "🥉", isTop3: true };
  return { bg: "bg-white", icon: `${index + 1}º`, isTop3: false };
};

const EstaAnual = ({
  playersStats = {},
  topN = 15,
  mode = "horizontal",
  className = "",
  years = [],
  data = null,
  showHomeAway = false,
  all = null,
}) => {
  const [open, setOpen] = useState(false);
  const [openTab, setOpenTab] = useState(null);
  const [openProm, setOpenProm] = useState(false);
  const [openTabProm, setOpenTabProm] = useState(null);
  const [openPJ, setOpenPJ] = useState(false);
  const [openTabPJ, setOpenTabPJ] = useState(null);
  const [openAños, setOpenAños] = useState(false);
  const [openTabAños, setOpenTabAños] = useState(null);

  const listaHistorica = useListaHistorica(all, topN);
  const listaLocal = useListaHistoricaLocal(all, topN);
  const listaVisitante = useListaHistoricaVisitante(all, topN);
  const listaMejorProm = useListaMejorPromedio(all, topN);
  const listaMejorPromLocal = useListaMejorPromedioLocal(all, topN);
  const listaMejorPromVisitante = useListaMejorPromedioVisitante(all, topN);
  const listaMasPJ = useListaMasPJ(all, topN);
  const listaMasPJLocal = useListaMasPJLocal(all, topN);
  const listaMasPJVisitante = useListaMasPJVisitante(all, topN);
  const resumenAños = useResumenPorAño(all);

  if (listaHistorica.length === 0) return null;

  const tabs = [
    { key: "general", label: `General`, list: listaHistorica },
    { key: "local", label: `Local`, list: listaLocal },
    { key: "visitante", label: `Visitante`, list: listaVisitante },
  ];

  const tabsProm = [
    { key: "prom-general", label: "General", list: listaMejorProm },
    { key: "prom-local", label: "Local", list: listaMejorPromLocal },
    {
      key: "prom-visitante",
      label: "Visitante",
      list: listaMejorPromVisitante,
    },
  ];

  const tabsPJ = [
    { key: "pj-general", label: "General", list: listaMasPJ },
    { key: "pj-local", label: "Local", list: listaMasPJLocal },
    { key: "pj-visitante", label: "Visitante", list: listaMasPJVisitante },
  ];

  const tabsAños = [
    { key: "años-general", label: "General", list: resumenAños.general },
    { key: "años-local", label: "Local", list: resumenAños.local },
    { key: "años-visitante", label: "Visitante", list: resumenAños.visitante },
  ];

  return (
    <div className="px-2">
      <RenderBloque
        titulo={`Top ${topN} Goleadores Históricos`}
        icono="🏆"
        tabs={tabs}
        open={open}
        setOpen={setOpen}
        openTab={openTab}
        setOpenTab={setOpenTab}
        fromColor="from-yellow-100"
        toColor="to-yellow-100"
        borderColor="border-yellow-200"
      />

      {/* Segundo Bloque: Promedio */}
      <RenderBloque
        titulo={`Top ${topN} Mejor Promedio Histórico`}
        icono="🎯"
        tabs={tabsProm}
        open={openProm}
        setOpen={setOpenProm}
        openTab={openTabProm}
        setOpenTab={setOpenTabProm}
        fromColor="from-sky-100"
        toColor="to-sky-100"
        borderColor="border-sky-200"
      />
      <RenderBloque
        titulo={`Top ${topN} Más Partidos Jugados`}
        icono="🏃"
        tabs={tabsPJ}
        open={openPJ}
        setOpen={setOpenPJ}
        openTab={openTabPJ}
        setOpenTab={setOpenTabPJ}
        fromColor="from-emerald-100"
        toColor="to-emerald-100"
        borderColor="border-emerald-200"
      />
      <RenderBloqueAnios
        titulo="Mejores Años Goleadores"
        icono="📅"
        tabs={tabsAños}
        open={openAños}
        setOpen={setOpenAños}
        openTab={openTabAños}
        setOpenTab={setOpenTabAños}
        fromColor="from-purple-100"
        toColor="to-purple-100"
        borderColor="border-purple-200"
      />
    </div>
  );
};

export default EstaAnual;

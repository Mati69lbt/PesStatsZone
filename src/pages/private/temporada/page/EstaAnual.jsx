// cspell: ignore funtions Estadisticas Historica nums
import React, { useState } from "react";
import { prettySafe } from "../../campeonatos/util/funtions";
import {
  useListaHistorica,
  useListaHistoricaLocal,
  useListaHistoricaVisitante,
  useListaMejorPromedio,
  useListaMejorPromedioLocal,
  useListaMejorPromedioVisitante,
} from "../utils/EstadisticasAnuales/useMemoGoalsMaps";
import { buildListFromMap } from "../utils/EstadisticasAnuales/estAnuales";
import { TablaHistorica } from "../utils/EstadisticasAnuales/TablaAnual";
import { RenderBloque } from "../utils/EstadisticasAnuales/RenderBloque";

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

  const listaHistorica = useListaHistorica(all, topN);
  const listaLocal = useListaHistoricaLocal(all, topN);
  const listaVisitante = useListaHistoricaVisitante(all, topN);
  const listaMejorProm = useListaMejorPromedio(all, topN);
  const listaMejorPromLocal = useListaMejorPromedioLocal(all, topN);
  const listaMejorPromVisitante = useListaMejorPromedioVisitante(all, topN);

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
    </div>
  );
};

export default EstaAnual;

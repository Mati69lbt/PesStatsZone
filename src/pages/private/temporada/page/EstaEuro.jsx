// cspell: ignore funtions Estadisticas Historica nums
import React, { useState } from "react";
import {
  useListaHistoricaEuro,
  useListaHistoricaLocalEuro,
  useListaHistoricaVisitanteEuro,
  useListaMejorPromedioEuro,
  useListaMejorPromedioLocalEuro,
  useListaMejorPromedioVisitanteEuro,
  useListaMasPJEuro,
  useListaMasPJLocalEuro,
  useListaMasPJVisitanteEuro,
  useResumenPorTemporada,
} from "../utils/EstadisticasAnuales/useMemoGoalsMaps";
import { RenderBloque } from "../utils/EstadisticasAnuales/RenderBloque";
import { RenderBloqueAnios } from "../utils/EstadisticasAnuales/RenderBloqueAnios";

const EstaEuro = ({ topN = 15, all = null }) => {
  const [open, setOpen] = useState(false);
  const [openTab, setOpenTab] = useState(null);
  const [openProm, setOpenProm] = useState(false);
  const [openTabProm, setOpenTabProm] = useState(null);
  const [openPJ, setOpenPJ] = useState(false);
  const [openTabPJ, setOpenTabPJ] = useState(null);
  const [openTemp, setOpenTemp] = useState(false);
  const [openTabTemp, setOpenTabTemp] = useState(null);

  // todos los hooks primero
  const listaHistorica = useListaHistoricaEuro(all, topN);
  const listaLocal = useListaHistoricaLocalEuro(all, topN);
  const listaVisitante = useListaHistoricaVisitanteEuro(all, topN);
  const listaMejorProm = useListaMejorPromedioEuro(all, topN);
  const listaMejorPromLocal = useListaMejorPromedioLocalEuro(all, topN);
  const listaMejorPromVisitante = useListaMejorPromedioVisitanteEuro(all, topN);
  const listaMasPJ = useListaMasPJEuro(all, topN);
  const listaMasPJLocal = useListaMasPJLocalEuro(all, topN);
  const listaMasPJVisitante = useListaMasPJVisitanteEuro(all, topN);
  const resumenTemp = useResumenPorTemporada(all);

  if (listaHistorica.length === 0) return null;

  const tabs = [
    { key: "general", label: "General", list: listaHistorica },
    { key: "local", label: "Local", list: listaLocal },
    { key: "visitante", label: "Visitante", list: listaVisitante },
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

  const tabsTemp = [
    { key: "temp-general", label: "General", list: resumenTemp.general },
    { key: "temp-local", label: "Local", list: resumenTemp.local },
    { key: "temp-visitante", label: "Visitante", list: resumenTemp.visitante },
  ];

  return (
    <div className="px-2">
      <RenderBloque
        titulo={`Top ${topN} Goleadores por Temporada`}
        icono="🌍"
        tabs={tabs}
        open={open}
        setOpen={setOpen}
        openTab={openTab}
        setOpenTab={setOpenTab}
        fromColor="from-emerald-100"
        toColor="to-emerald-100"
        borderColor="border-emerald-200"
      />
      <RenderBloque
        titulo={`Top ${topN} Mejor Promedio por Temporada`}
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
        titulo={`Top ${topN} Más Partidos por Temporada`}
        icono="🏃"
        tabs={tabsPJ}
        open={openPJ}
        setOpen={setOpenPJ}
        openTab={openTabPJ}
        setOpenTab={setOpenTabPJ}
        fromColor="from-orange-100"
        toColor="to-orange-100"
        borderColor="border-orange-200"
      />
      <RenderBloqueAnios
        titulo="Mejores Temporadas Goleadoras"
        icono="📅"
        tabs={tabsTemp}
        open={openTemp}
        setOpen={setOpenTemp}
        openTab={openTabTemp}
        setOpenTab={setOpenTabTemp}
        fromColor="from-purple-100"
        toColor="to-purple-100"
        borderColor="border-purple-200"
      />
    </div>
  );
};

export default EstaEuro;

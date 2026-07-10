import React, { useState } from "react";
import { usePointsChartData } from "../hooks/usePointsChartData";
import SegmentedTabs from "./SegmentedTabs";
import BreakdownFilters from "./BreakdownFilters";
import PointsLineChart from "./PointsLineChart";

// Recibe matches y torneosConfig como props desde Graficos.jsx
const GraficosOld = ({ matches = [], torneosConfig = {} }) => {
  const [view, setView] = useState("general");
  const [breakdown, setBreakdown] = useState("all");
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const { years, tournaments, chartData, yMax } = usePointsChartData(matches, {
    view,
    breakdown,
    selectedYear,
    selectedTournament,
    torneosConfig,
  });

  return (
    <div className="mt-2 space-y-3">
      <SegmentedTabs value={view} onChange={setView} />

      <BreakdownFilters
        breakdown={breakdown}
        setBreakdown={(v) => {
          setBreakdown(v);
          setSelectedYear(null);
          setSelectedTournament(null);
        }}
        years={years}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        tournaments={tournaments}
        selectedTournament={selectedTournament}
        setSelectedTournament={setSelectedTournament}
      />

      <PointsLineChart chartData={chartData} yMax={yMax} />
    </div>
  );
};

export default GraficosOld;

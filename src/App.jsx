// cspell: ignore Notiflix notiflix useAuth logueado formacion analisis

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Public from "./pages/public/Public";
import Login from "./pages/public/Login";
import Private from "./pages/private/Private";
import Partido from "./pages/private/match/Partido";
import Versus from "./pages/private/versus/page/Versus";
import TeamForm from "./pages/private/teamForm/page/TeamForm";
import useAuth from "./hooks/useAuth";
import { usePartido } from "./context/PartidoReducer";
import { useLineups } from "./context/LineUpProvider";
import Campeonatos from "./pages/private/campeonatos/page/Campeonatos";
import Analysis from "./pages/private/analisis/page/Analysis";
import Season from "./pages/private/temporada/page/Season";
import Scorers from "./pages/private/goleadores/page/Scorers";
import Palmares from "./pages/private/versus/palmares/page/Palmares";

function Hydrator() {
  const { uid } = useAuth();
  const { dispatch: matchDispatch } = usePartido();
  const { dispatch: lineupDispatch } = useLineups();
  useUserData(uid, matchDispatch, lineupDispatch);
  return null;
}
const repoName = "PesStatsZone";
const App = () => {
  return (
    <BrowserRouter basename={`/${repoName}/`}>
      <Routes>
        <Route element={<Public />}>
          <Route path="/" element={<Login />} />
        </Route>
        <Route element={<Private />}>
          <Route path="*" element={<Hydrator />} />
          <Route path="/registrar-partido" element={<Partido />} />
          <Route path="/formacion" element={<TeamForm />} />
          <Route path="/versus" element={<Versus />} />
          <Route path="/campeonatos" element={<Campeonatos />} />
          <Route path="/analisis" element={<Analysis />} />
          <Route path="/temporadas" element={<Season />} />
          <Route path="/goleadores" element={<Scorers />} />
          <Route path="/palmares" element={<Palmares />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

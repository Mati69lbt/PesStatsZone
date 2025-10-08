// cspell: ignore Notiflix notiflix useAuth logueado formacion

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Public from "./pages/public/Public";
import Login from "./pages/public/Login";
import Private from "./pages/private/Private";
import Partido from "./pages/private/match/Partido";
import Versus from "./pages/private/versus/page/Versus"
import TeamForm from "./pages/private/teamForm/page/TeamForm";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Public />}>
          <Route path="/" element={<Login />} />
        </Route>
        <Route element={<Private />}>
          <Route path="/registrar-partido" element={<Partido />} />
          <Route path="/formacion" element={< TeamForm />} />
          <Route path="/versus" element={<Versus />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

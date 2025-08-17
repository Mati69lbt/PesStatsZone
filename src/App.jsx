import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Public from "./pages/public/Public";
import Login from "./pages/public/Login";
import Private from "./pages/private/Private";
import TeamForm from "./pages/private/TeamForm";

const App = () => {
  return (
    <BrowserRouter>
      <Routes> 
        <Route element={<Public />}> 
        <Route path="/" element={<Login/>}/>
        </Route>
        <Route element={<Private />}>
          <Route path="/equipo" element={<TeamForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
};

export default App;

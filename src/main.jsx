// cspell: ignore Notiflix  useAuth logueado notiflix
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import Notiflix from "notiflix";
import { LineupsProvider } from "./context/LineUpProvider.jsx";
import { PartidoProvider } from "./context/PartidoReducer.jsx";

Notiflix.Notify.init({
  position: "center-bottom",
  distance: "20px",
  timeout: 3000,
  clickToClose: true,
  fontSize: "16px",
  width: "280px",
});




createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <LineupsProvider>
        <PartidoProvider>
          <App />
        </PartidoProvider>
      </LineupsProvider>
    </AuthProvider>
  </StrictMode>
);

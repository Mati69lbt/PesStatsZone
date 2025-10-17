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

/**************** BORRAR PARA ABAJO ***********************/
// --- Anti-duplicados para console.* ---
(function () {
  if (window.__dedupeInstalled) return;
  window.__dedupeInstalled = true;

  const seen = new Map(); // key -> timestamp
  const WINDOW_MS = 250;  // ventana de tiempo para considerar duplicado

  const levels = ["log", "info", "warn", "error"];
  levels.forEach((level) => {
    const orig = console[level].bind(console);
    console[level] = (...args) => {
      // armamos una firma estable del mensaje
      const signature = level + "::" + args.map((a) => {
        if (a instanceof Error) return a.stack || a.message;
        try { return typeof a === "string" ? a : JSON.stringify(a); }
        catch { return String(a); }
      }).join("||");

      const now = Date.now();
      const last = seen.get(signature) || 0;
      if (now - last < WINDOW_MS) {
        // duplicado reciente -> ignoramos
        return;
      }
      seen.set(signature, now);

      // opcional: limpiar el Map para que no crezca sin fin
      if (seen.size > 500) {
        const cutoff = now - WINDOW_MS;
        for (const [k, t] of seen) if (t < cutoff) seen.delete(k);
      }

      // llamamos al original y que también lo capture tu buffer (si lo tenés)
      orig(...args);
    };
  });
})();

// --- Console capture (solo en DEV o ?debug=1) ---
const __isDev =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.DEV) ||
  (typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debug"));

if (typeof window !== "undefined" && __isDev && !window.__consolePatched) {
  window.__consolePatched = true;
  window.__logBuffer = [];

  const levels = ["log", "info", "warn", "error"];
  levels.forEach((level) => {
    const orig = console[level].bind(console);
    console[level] = (...args) => {
      try {
        window.__logBuffer.push({
          level,
          time: new Date().toISOString(),
          args: args.map((a) => {
            if (a instanceof Error) return a.stack || a.message;
            try {
              return JSON.stringify(a);
            } catch {
              return String(a);
            }
          }),
        });
      } catch {}
      orig(...args);
    };
  });

  // errores no capturados
  window.addEventListener("error", (e) => {
    window.__logBuffer.push({
      level: "error",
      time: new Date().toISOString(),
      args: [e?.error?.stack || e?.message || "window.onerror"],
    });
  });
  window.addEventListener("unhandledrejection", (e) => {
    window.__logBuffer.push({
      level: "error",
      time: new Date().toISOString(),
      args: ["unhandledrejection", String(e?.reason)],
    });
  });

  // función global para descargar
  window.downloadLogs = function () {
    const data = JSON.stringify(window.__logBuffer || [], null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "logs.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
}
// --- fin console capture ---
/**************** BORRAR PARA ARRIBA ***********************/

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

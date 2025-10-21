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
// --- Anti-duplicados + origen para console.* ---

// Lee params desde ?... y también desde #...?... (HashRouter)
const __RAW_CONSOLE = (() => {
  if (typeof window === "undefined") return false;
  const parts = [];
  if (window.location.search) parts.push(window.location.search.slice(1));
  if (window.location.hash && window.location.hash.includes("?")) {
    parts.push(window.location.hash.split("?")[1]);
  }
  const qs = new URLSearchParams(parts.join("&"));
  return qs.has("rawconsole") || qs.get("console") === "raw";
})();

(function () {
  if (__RAW_CONSOLE) return;               // no parchear: queremos callsite real
  if (typeof window === "undefined") return;
  if (window.__dedupeInstalled) return;
  window.__dedupeInstalled = true;

  // helper para agregar [at Archivo.jsx:línea:col]
  const whereTag = () => {
    try {
      const stack = new Error().stack?.split("\n") || [];
      const frame = stack.find(
        (l) => l.includes(".jsx") && !l.includes("main.jsx")
      );
      if (!frame) return "";
      const m = frame.match(/(.*?)(\/|\\)([^/\\]+\.jsx:\d+:\d+)/);
      if (m?.[3]) return ` [at ${m[3]}]`;
    } catch {}
    return "";
  };

  const seen = new Map(); // key -> timestamp
  const WINDOW_MS = 250;  // ventana para considerar duplicado
  const levels = ["log", "info", "warn", "error"];

  levels.forEach((level) => {
    const orig = console[level].bind(console);
    console[level] = (...args) => {
      // firma para dedupe
      const signature =
        level +
        "::" +
        args
          .map((a) => {
            if (a instanceof Error) return a.stack || a.message;
            try {
              return typeof a === "string" ? a : JSON.stringify(a);
            } catch {
              return String(a);
            }
          })
          .join("||");

      const now = Date.now();
      const last = seen.get(signature) || 0;
      if (now - last < WINDOW_MS) return; // duplicado reciente
      seen.set(signature, now);

      // limpieza de firmas viejas
      if (seen.size > 500) {
        const cutoff = now - WINDOW_MS;
        for (const [k, t] of seen) if (t < cutoff) seen.delete(k);
      }

      // anteponer origen legible
      const tag = whereTag();
      if (tag) orig(`[${level.toUpperCase()}]${tag}`, ...args);
      else orig(...args);
    };
  });
})();

// --- Console capture (solo en DEV o ?debug=1) ---
const __isDev =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.DEV) ||
  (typeof window !== "undefined" &&
    new URLSearchParams(
      (window.location.search || "") +
        (window.location.hash.includes("?")
          ? "&" + window.location.hash.split("?")[1]
          : "")
    ).has("debug"));

if (typeof window !== "undefined" && __isDev && !window.__consolePatched) {
  if (__RAW_CONSOLE) {
    // no capturar tampoco
  } else {
    window.__consolePatched = true;
    window.__logBuffer = [];

    // guardar originales para poder restaurar luego
    window.__origConsole = window.__origConsole || {};

    // helper de origen (mismo que arriba)
    const whereTag = () => {
      try {
        const stack = new Error().stack?.split("\n") || [];
        const frame = stack.find(
          (l) => l.includes(".jsx") && !l.includes("main.jsx")
        );
        if (!frame) return "";
        const m = frame.match(/(.*?)(\/|\\)([^/\\]+\.jsx:\d+:\d+)/);
        if (m?.[3]) return ` [at ${m[3]}]`;
      } catch {}
      return "";
    };

    const levels = ["log", "info", "warn", "error"];
    levels.forEach((level) => {
      const orig = console[level].bind(console);
      if (!window.__origConsole[level]) window.__origConsole[level] = orig;

      console[level] = (...args) => {
        // buffer para exportar
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

        // anteponer origen legible también aquí
        const tag = whereTag();
        if (tag) window.__origConsole[level](`[${level.toUpperCase()}]${tag}`, ...args);
        else window.__origConsole[level](...args);
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

    // util para descargar logs
    window.downloadLogs = function () {
      const data = JSON.stringify(window.__logBuffer || [], null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "logs.json";
      a.click();
      URL.revokeObjectURL(a.href);
    };

    // util para restaurar consola cruda sin recargar
    window.unpatchConsole = function () {
      if (!window.__origConsole) return;
      console.log = window.__origConsole.log;
      console.info = window.__origConsole.info;
      console.warn = window.__origConsole.warn;
      console.error = window.__origConsole.error;
      window.__consolePatched = false;
      console.info("[console] restored to raw");
    };
  }
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

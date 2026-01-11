import React, { useEffect, useRef } from "react";

export const useConsoleDownloader = () => {
  const logsRef = useRef([]);

  useEffect(() => {
    // 1. Guardamos la función original
    const originalLog = console.log;

    // 2. Sobrescribimos console.log
    console.log = (...args) => {
      // Guardamos el log en nuestro array (convertido a texto)
      logsRef.current.push(
        args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
          )
          .join(" ")
      );

      // Seguimos mostrando el log en la consola real
      originalLog.apply(console, args);
    };

    // Limpieza al desmontar
    return () => {
      console.log = originalLog;
    };
  }, []);

  const downloadLogs = () => {
    const blob = new Blob([logsRef.current.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `console-logs-${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { downloadLogs };
};

// ---------------------------
{/* <div>
  <button
    onClick={downloadLogs}
    style={{ backgroundColor: "green", color: "white" }}
  >
    Descargar Logs .txt
  </button>
</div>; */}
// ---------------------------

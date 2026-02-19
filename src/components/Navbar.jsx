// cspell: ignore hamburguesa forzarHamburguesa Confirmacion analisis goleadoresxcampeonato formacion cerrarSesion Notiflix notiflix Firestore firestore
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Notiflix from "notiflix";
import useAuth from "../hooks/useAuth";
import { usePartido } from "../context/PartidoReducer";
import { fetchUserData } from "../hooks/useUserData";
import { useLineups } from "../context/LineUpProvider";
import { pretty } from "../pages/private/match/utils/pretty";

import { doc, setDoc } from "firebase/firestore";
import { db } from "../configuration/firebase.js";

export default function Navbar() {
  const { user, handleLogout, uid, isAuthenticated } = useAuth();
  const location = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [forzarHamburguesa, setForzarHamburguesa] = useState(false);

  const { dispatch: matchDispatch } = usePartido();
  const { dispatch: lineupDispatch } = useLineups();

  const recargarDatos = async () => {
    if (uid) {
      await fetchUserData(uid, matchDispatch);
    }
  };

  useEffect(() => {
    const evaluarPantalla = () => {
      const ancho = window.innerWidth;
      const alto = window.innerHeight;
      setForzarHamburguesa(ancho < 1024 || alto < 432);
    };

    evaluarPantalla(); // al cargar
    window.addEventListener("resize", evaluarPantalla);
    window.addEventListener("orientationchange", evaluarPantalla);
    return () => {
      window.removeEventListener("resize", evaluarPantalla);
      window.removeEventListener("orientationchange", evaluarPantalla);
    };
  }, []);

  const isActivePath = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const iconClass = (path) =>
    `inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 ${
      isActivePath(path)
        ? "ring-3 ring-blue-900 ring-offset-2 ring-offset-white"
        : "ring-0"
    }`;

  const linkClass = () => "block px-2 py-2 rounded transition text-gray-700";

  const mostrarConfirmacionReset = () => {
    Notiflix.Confirm.show(
      "Reiniciar",
      "Esto borrará el club activo, la formación y el formulario del partido en esta sesión. ¿Continuar?",
      "Sí",
      "No",
      async () => {
        // ← ahora async
        try {
          // 1) Limpiar estado EN MEMORIA
          lineupDispatch({ type: "CLUB_RESET" });
          lineupDispatch({ type: "LINEUP_RESET" });
          matchDispatch({
            type: "ACTUALIZAR_CAMPO",
            campo: "activeClub",
            valor: "",
          });
          matchDispatch({ type: "RESET_FORM" });

          // 2) Limpiar Firestore del usuario actual (campos en la raíz)
          if (uid) {
            const userRef = doc(db, "users", uid);
            await setDoc(
              userRef,
              {
                activeClub: "",
                lineups: {},
                players: [],
                starters: [],
                useClub: false,
                // agrega aquí cualquier otro bucket que quieras vaciar
                // playersStats: {},
              },
              { merge: true },
            );
          }

          Notiflix.Notify.success("Listo: se reinició la sesión de trabajo.");
        } catch (e) {
          Notiflix.Notify.failure("No se pudo reiniciar.");
        }
      },
      () => {},
    );
  };

  const cerrarSesion = () => {
    Notiflix.Confirm.show(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      "Sí",
      "No",
      async () => {
        try {
          // 1) Limpiar estados EN MEMORIA para evitar arrastre entre usuarios
          // LineUps: limpia activeClub, players y lineups
          lineupDispatch({ type: "CLUB_RESET" });

          // Partido: dejar el formulario limpio y sin club activo
          matchDispatch({
            type: "ACTUALIZAR_CAMPO",
            campo: "activeClub",
            valor: "",
          });
          matchDispatch({ type: "RESET_FORM" });

          // 2) Cerrar sesión (Auth)
          await handleLogout();
        } catch (e) {
          Notiflix.Notify.failure("No se pudo cerrar sesión correctamente");
          return;
        }
        Notiflix.Notify.success("Sesión cerrada");
      },
      () => {
        Notiflix.Notify.info("Sesión no cerrada");
      },
      {
        width: "300px",
        borderRadius: "8px",
        titleColor: "#333",
        messageColor: "#555",
        okButtonBackground: "#4CAF50",
        cancelButtonBackground: "#f44336",
      },
    );
  };

  const links = [
    { path: "/registrar-partido", label: "🏠" },
    { path: "/versus", label: "🆚" },
    { path: "/nextmatch", label: "⚔️" },
    { path: "/temporadas", label: "🗓️" },
    { path: "/ultimos-diez", label: "🔟" },
    { path: "/analisis", label: "🧤" },
    { path: "/graficos", label: "📈" },
    { path: "/campeonatos", label: "🏆" },
    { path: "/partidos", label: "📋" },
    { path: "/goleadores", label: "⚽" },
    { path: "/formacion", label: "📝" },
    { path: "/palmares", label: "👑" },
  ];

  return (
    <nav className="bg-white shadow-md w-full sticky top-0 z-50">
      {!forzarHamburguesa && (
        <div className="max-w-6xl mx-auto px-1 py-3 flex items-center gap-2">
          {/* Izquierda: marca */}
          <span
            className="text-2xl font-bold text-blue-600 whitespace-nowrap cursor-pointer"
            onClick={recargarDatos}
          >
            ⚽ Pes Stats Zone
          </span>

          {/* Centro: iconos (no wrap, si no entra, scroll horizontal) */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="flex items-center flex-nowrap overflow-x-auto">
              {links.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`${linkClass(path)} flex items-center text-xl`}
                >
                  <span className={iconClass(path)}>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Derecha: DT + acciones (siempre en la misma línea) */}
          <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
            {user && (
              <div className="flex flex-col items-center justify-center border p-2 rounded-lg">
                <label>Dt</label>
                <span className="text-gray-700 font-semibold max-w-[140px] truncate">
                  {pretty(user.displayName)}
                </span>
              </div>
            )}

            <button
              onClick={mostrarConfirmacionReset}
              className="text-red-600 hover:uppercase hover:font-bold flex items-center gap-1"
            >
              🗑️ Reiniciar
            </button>

            <button
              onClick={() => cerrarSesion()}
              className="bg-red-400 text-white rounded-xl px-4 hover:bg-red-600 flex items-center gap-1"
            >
              Salir
            </button>
          </div>
        </div>
      )}

      {forzarHamburguesa && (
        <button
          type="button"
          className="fixed top-3 right-3 bg-white rounded-full shadow-md p-2 text-gray-700 text-2xl z-40"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
          style={{ minWidth: "48px", minHeight: "48px" }}
        >
          ☰
        </button>
      )}

      {/* MENÚ DESPLEGABLE */}
      {menuAbierto && forzarHamburguesa && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 flex"
          onClick={() => setMenuAbierto(false)}
        >
          <div
            className="bg-white w-full h-full p-6 shadow-lg flex flex-col items-end overflow-y-auto max-h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-3xl font-bold text-blue-600 flex items-center gap-2 w-full justify-end">
              ⚽ Pes Stats Zone
              <button
                className="ml-2 text-gray-400 text-2xl"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                tabIndex={0}
              >
                ×
              </button>
            </div>

            <div className="w-full grid grid-cols-3 gap-4">
              {links.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`${linkClass(
                    path,
                  )} flex items-center justify-center rounded-xl p-3 text-3xl`}
                  onClick={() => setMenuAbierto(false)}
                  aria-label={path}
                  title={path}
                >
                  <span className={iconClass(path)}>{label}</span>
                </Link>
              ))}

              {user && (
                <div className="flex flex-col items-center justify-center rounded-xl p-3 border text-center">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    DT
                  </span>
                  <span className="text-sm font-semibold text-gray-800 break-words">
                    {pretty(user.displayName)}
                  </span>
                </div>
              )}

              <button
                onClick={() => {
                  setMenuAbierto(false);
                  mostrarConfirmacionReset();
                }}
                className="flex flex-col items-center justify-center rounded-xl p-3 text-red-600"
              >
                <span className="text-s mt-1">Reiniciar</span>
              </button>

              <button
                onClick={() => {
                  setMenuAbierto(false);
                  cerrarSesion();
                }}
                className="flex flex-col items-center justify-center rounded-xl p-3 text-red-600"
              >
                <span className="text-s mt-1">Salir</span>
              </button>
              <div className="flex flex-col items-center justify-center rounded-xl border text-center">
                <span>Versión: 28.2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

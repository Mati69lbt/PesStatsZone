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
      setForzarHamburguesa(ancho < 933 || alto < 431);
    };

    evaluarPantalla(); // al cargar
    window.addEventListener("resize", evaluarPantalla);
    return () => window.removeEventListener("resize", evaluarPantalla);
  }, []);

  const linkClass = (path) =>
    `block px-4 py-2 rounded hover:bg-blue-100 transition ${
      location.pathname === path ? "font-bold text-blue-700" : "text-gray-700"
    }`;

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
              { merge: true }
            );
          }

          Notiflix.Notify.success("Listo: se reinició la sesión de trabajo.");
        } catch (e) {
          Notiflix.Notify.failure("No se pudo reiniciar.");
        }
      },
      () => {}
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
      }
    );
  };

  const links = [
    { path: "/registrar-partido", label: "🏠" },
    { path: "versus", label: "🆚" },
    { path: "/temporadas", label: "🗓️" },
    { path: "/analisis", label: "📈 " },
    { path: "/campeonatos", label: "🏆" },
    { path: "/goleadores", label: "⚽" },
    { path: "/formacion", label: "📝" },
    { path: "/palmares", label: "👑" },
  ];

  return (
    <nav className="bg-white shadow-md w-full sticky top-0 z-0">
      {!forzarHamburguesa && (
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span
            className="text-xl font-bold text-blue-600 whitespace-nowrap cursor-pointer"
            onClick={recargarDatos}
          >
            ⚽ Pes Stats Zone
          </span>
          <div className="space-x-2 text-sm flex">
            {links.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`${linkClass(path)} flex items-center gap-1 text-xl`}
              >
                {label}
              </Link>
            ))}
            {user && (
              <div className="flex flex-col items-center justify-center border p-2 rounded-lg">
                <label>Dt</label>
                <span className="text-gray-700 font-semibold">
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
              className=" bg-red-400 text-white rounded-xl px-4 hover:bg-red-600 flex items-center gap-1"
            >
              Salir
            </button>
          </div>
        </div>
      )}

      {forzarHamburguesa && (
        <button
          type="button"
          className="fixed top-3 right-3 bg-white rounded-full shadow-md p-2 text-gray-700 text-2xl z-20"
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
            <div className="mb-6 text-xl font-bold text-blue-600 flex items-center gap-2 w-full justify-end">
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
            <div className="flex flex-col gap-2 w-full items-end">
              {links.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`${linkClass(
                    path
                  )} flex items-center gap-1 justify-end text-right w-full`}
                  onClick={() => setMenuAbierto(false)}
                >
                  {label}
                </Link>
              ))}
              {user && (
                <div className="flex items-center gap-2  justify-end  text-right w-full text-gray-700">
                  <label className="font-semibold">Dt</label>
                  <span>{user.displayName}</span>
                </div>
              )}
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  mostrarConfirmacionReset();
                }}
                className="text-red-600 hover:underline flex items-center gap-1 justify-end  mt-4 text-right w-full"
              >
                🗑️ Reiniciar
              </button>
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  cerrarSesion();
                }}
                className="text-red-600 hover:underline flex items-center gap-1 justify-end  mt-4 text-right w-full"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

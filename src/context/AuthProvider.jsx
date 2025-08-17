// cspell: ignore Notiflix  useAuth logueado notiflix
import { createContext, useEffect, useReducer } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../configuration/firebase";
import Notiflix from "notiflix";

const initialState = {
  user: null,
  status: "loading" | "idle" | "authenticated" | "error",
  error: null,
};

export const AuthContext = createContext();

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_INIT":
      return { ...state, status: "loading" };
    case "AUTH_READY":
      return {
        ...state,
        user: action.payload,
        status: action.payload ? "authenticated" : "idle",
        error: null,
      };
    case "LOGIN_REQUEST":
      return { ...state, status: "loading", error: null };
    case "LOGIN_SUCCESS":
      return { ...state, user: action.payload, status: "authenticated" };
    case "LOGIN_FAILURE":
      return { ...state, user: null, status: "error", error: action.payload };
    case "LOGOUT_SUCCESS":
      return { ...state, user: null, status: "idle" };
    case "REGISTER_REQUEST":
      return { ...state, status: "loading", error: null };
    case "REGISTER_SUCCESS":
      return { ...state, user: action.payload, status: "authenticated" };
    case "REGISTER_FAILURE":
      return { ...state, user: null, status: "error", error: action.payload };
    default:
      return state;
  }
}

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    dispatch({ type: "AUTH_INIT" });
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch({ type: "AUTH_READY", payload: user });
      } else {
        dispatch({ type: "AUTH_READY", payload: null });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      dispatch({ type: "LOGIN_SUCCESS", payload: userCredential.user });
      Notiflix.Notify.success("Inicio de sesión exitoso");
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error });
      Notiflix.Notify.failure("Error al iniciar sesión");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT_SUCCESS" });
      Notiflix.Notify.success("Sesión cerrada");
    } catch (error) {
      Notiflix.Notify.failure("Error al cerrar sesión");
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleRegister = async (email, password) => {
    dispatch({ type: "REGISTER_REQUEST" });
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      dispatch({ type: "REGISTER_SUCCESS", payload: userCredential.user });
      Notiflix.Notify.success("Registro exitoso");
    } catch (error) {
      dispatch({
        type: "REGISTER_FAILURE",
        payload: "Error al registrar usuario",
      });
      Notiflix.Notify.failure("Error al registrar usuario");
      console.error("Error al registrar usuario:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.status === "loading",
        handleLogin,
        handleLogout,
        handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

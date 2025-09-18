// cspell: ignore Notiflix  useAuth logueado notiflix
import { createContext, useEffect, useReducer } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../configuration/firebase";

import Notiflix from "notiflix";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const initialState = {
  user: null,
  status: "loading",
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch({ type: "AUTH_READY", payload: null });
        return;
      }
      let name = user.displayName?.trim() || "";
      if (!name) {
        try {
          // 1) Intentar leer dtName desde Firestore
          const snap = await getDoc(doc(db, "users", user.uid));
          const dt = snap.exists() ? (snap.data()?.dtName || "").trim() : "";
          if (dt) {
            name = dt;
            // 2) (Opcional) Persistir en Auth para próximos logins
            try {
              await updateProfile(user, { displayName: dt });
            } catch {}
          }
        } catch {}
      }
      // 3) Fallback final: parte local del email
      if (!name) name = user.email?.split("@")[0] || "";

      // 4) “Congelar” un objeto con displayName resuelto
      const mergedUser = { ...user, displayName: name };
      dispatch({ type: "AUTH_READY", payload: mergedUser });
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

  const handleRegister = async (email, password, dtName) => {
    dispatch({ type: "REGISTER_REQUEST" });
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: dtName,
      });
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          dtName,
          email,
          createdAt: serverTimestamp(),
        },
        { merge: true }
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
        uid: state.user?.uid,
        isAuthenticated: state.status === "authenticated",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

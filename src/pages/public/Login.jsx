// cspell: ignore Notiflix notiflix useAuth logueado formacion
import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Notiflix from "notiflix";
import Register from "./Register";
import useForm from "../../hooks/useForm";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { form, changed } = useForm();
  const { user, loading, handleLogin } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/partidos", { replace: true });
    } else {
      return;
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (loading) {
      Notiflix.Loading.circle("Cargando");
    }
    return () => {
      Notiflix.Loading.remove();
    };
  }, [loading]);

  const loginUser = async (e) => {
    e.preventDefault();
    let { email, password } = form;
    if (!email || !password) {
      Notiflix.Notify.failure("Por favor, completa todos los campos");
      return;
    }
    try {
      const response = await handleLogin(email, password);
    } catch (error) {
      Notiflix.Notify.failure("Error al iniciar sesión");
      console.error("Error al iniciar sesión:", error);
    }
  };

  const formRegister = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h1>
      <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <form action="" onSubmit={loginUser}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            onChange={changed}
            className="w-full border rounded p-2"
          />
          <label htmlFor="password">Contraseña</label>
          <input
            type={viewPassword ? "text" : "password"}
            name="password"
            id="password"
            onChange={changed}
            className="w-full border rounded p-2"
          />
          <button
            type="button"
            onClick={() => setViewPassword(!viewPassword)}
            className="text-sm text-blue-600 hover:text-red-600"
          >
            {viewPassword ? "Ocultar Contraseña" : "Ver Contraseña"}
          </button>
          <input
            type="submit"
            value={"Ingresar"}
            className="text-blue-600 hover:font-bold bg-gray-200 shadow-md rounded-xl p-2 w-full cursor-pointer mt-2"
          />
        </form>
      </div>

      <button
        onClick={formRegister}
        className="text-2xl font-bold mb-4 mt-4 text-center hover:text-blue-600 hover:cursor-pointer"
      >
        Registrarse
      </button>

      {showRegister && <Register />}
    </div>
  );
};

export default Login;

// cspell: ignore Notiflix notiflix useAuth logueado
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
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/equipo", { replace: true });
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
    }
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
    <div>
      <div>
        <form action="" onSubmit={loginUser}>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" onChange={changed} />
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            onChange={changed}
          />
          <input type="submit" value={"Ingresar"} />
        </form>
      </div>

      <button onClick={formRegister}>Registrarse</button>

      {showRegister && <Register />}
    </div>
  );
};

export default Login;

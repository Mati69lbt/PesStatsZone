//cspell:ignore Notiflix useAuth logueado notiflix
import React from "react";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";
import Notiflix from "notiflix";

const Register = () => {
  const { handleRegister } = useAuth();
  const { form, changed } = useForm();

  const RegisterUser = async (e) => {
    e.preventDefault();
    let newUser = form;

    if (!newUser.email || !newUser.password || !newUser.nombre) {
      Notiflix.Notify.failure("Por favor, completa todos los campos");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      Notiflix.Notify.failure("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await handleRegister(
        newUser.email,
        newUser.password,
        newUser.nombre
      );
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
  };
  return (
    <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
      <form onSubmit={RegisterUser}>
        <label htmlFor="nombre">Director Técnico</label>
        <input
          name="nombre"
          className="w-full border rounded p-2"
          type="text"
          placeholder="Nombre del DT"
          required
          onChange={changed}
        />
        <label htmlFor="email">Email</label>
        <input
          name="email"
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          required
          onChange={changed}
        />
        <label htmlFor="password">Contraseña</label>
        <input
          name="password"
          className="w-full border rounded p-2"
          type="password"
          placeholder="Contraseña"
          required
          onChange={changed}
        />
        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <input
          name="confirmPassword"
          className="w-full border rounded p-2"
          type="password"
          placeholder="Confirmar Contraseña"
          required
          onChange={changed}
        />
        <input
          className="text-blue-600 hover:underline bg-gray-200 shadow-md rounded-xl p-2 w-full cursor-pointer mt-2"
          type="submit"
          value={"Registrarse"}
        />
      </form>
    </div>
  );
};

export default Register;

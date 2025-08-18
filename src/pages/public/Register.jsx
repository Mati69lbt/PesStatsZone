import React from "react";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const { handleRegister } = useAuth();
  return (
    <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
      <form onSubmit={handleRegister}>
        <label htmlFor="nombre">Director Técnico</label>
        <input
          className="w-full border rounded p-2"
          type="text"
          placeholder="Nombre del DT"
          required
        />
        <label htmlFor="email">Email</label>
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          required
        />
        <label htmlFor="password">Contraseña</label>
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Contraseña"
          required
        />
        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Confirmar Contraseña"
          required
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

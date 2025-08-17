import React from "react";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const { handleRegister } = useAuth();
  return (
    <div>
      <form onSubmit={handleRegister}>
        <label htmlFor="nombre">Director Técnico</label>
        <input type="text" placeholder="Nombre del DT" required />
        <label htmlFor="email">Email</label>
        <input type="email" placeholder="Email" required />
        <label htmlFor="password">Contraseña</label>
        <input type="password" placeholder="Contraseña" required />
        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <input type="password" placeholder="Confirmar Contraseña" required />
        <input type="submit" value={"Registrarse"} />
      </form>
    </div>
  );
};

export default Register;

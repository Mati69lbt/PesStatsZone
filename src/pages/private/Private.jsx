// cspell: ignore Notiflix notiflix useAuth logueado

import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Notiflix from "notiflix";
import Navbar from "../../components/Navbar";

const Private = () => {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) {
      Notiflix.Loading.circle("Cargando");
    }
    return () => {
      Notiflix.Loading.remove();
    };
  }, [loading]);

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Private;

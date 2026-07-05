import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // Mientras se confirma la sesión contra el backend, no se muestra
  // ni la app ni el login: evita un flash de contenido protegido.
  if (cargando) {
    return <p className="estado-cargando">Verificando sesión...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
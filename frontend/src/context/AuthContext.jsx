import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // Arranca en true: hasta no confirmar contra el backend, no sabemos
  // si hay sesión o no. Evita un parpadeo donde se ve "no logueado"
  // por una fracción de segundo aunque sí haya sesión válida.
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .obtenerSesion()
      .then((datos) => setUsuario(datos.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (nombreUsuario, contrasena) => {
    const datos = await api.login(nombreUsuario, contrasena);
    setUsuario(datos.usuario);
  }, []);

  const cerrarSesion = useCallback(async () => {
    await api.logout();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return contexto;
}
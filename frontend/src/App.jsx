import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import "./styles/app.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";
import LoginPage from "./pages/LoginPage";
import PacientesPage from "./pages/PacientesPage";
import NuevoPacientePage from "./pages/NuevoPacientePage";
import EditarPacientePage from "./pages/EditarPacientePage";
import SeguimientoPage from "./pages/SeguimientoPage";
import HemisfericidadPage from "./pages/HemisfericidadPage";
import RadiografiasPage from "./pages/RadiografiasPage";

function Marca({ onClick }) {
  return (
    <button className="marca" onClick={onClick}>
      <svg width="18" height="26" viewBox="0 0 20 28" fill="none" aria-hidden="true">
        <circle cx="10" cy="3" r="3" fill="var(--color-accent)" />
        <circle cx="10" cy="11" r="2.6" fill="var(--color-primary)" />
        <circle cx="10" cy="18" r="2.2" fill="var(--color-primary)" />
        <circle cx="10" cy="24" r="1.8" fill="var(--color-primary)" />
      </svg>
      Hamada Quiropraxia
    </button>
  );
}

function BarraNavegacion() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  async function manejarLogout() {
    await cerrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="barra-navegacion">
      <Marca onClick={() => navigate("/pacientes")} />
      <div className="enlaces-navegacion">
        <NavLink to="/pacientes" className={({ isActive }) => (isActive ? "activo" : "")}>
          Pacientes
        </NavLink>
      </div>
      <div className="sesion-actual">
        <span className="usuario-actual">{usuario}</span>
        <button className="btn-texto" onClick={manejarLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

function AppShell() {
  const location = useLocation();
  const esLogin = location.pathname === "/login";

  return (
    <div className="app-shell">
      {/* La barra de navegación (y el nombre de usuario, botón de logout,
          etc.) directamente no existe en la pantalla de login: ahí no
          hay nada de la app visible todavía, solo el formulario. */}
      {!esLogin && <BarraNavegacion />}
      <main className="contenido-principal">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Toda ruta que no sea /login pasa por RutaProtegida.
              Sin sesión válida, no se renderiza nada de esto. */}
          <Route
            path="/"
            element={
              <RutaProtegida>
                <PacientesPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pacientes"
            element={
              <RutaProtegida>
                <PacientesPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pacientes/nuevo"
            element={
              <RutaProtegida>
                <NuevoPacientePage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pacientes/:dni/editar"
            element={
              <RutaProtegida>
                <EditarPacientePage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pacientes/:dni/hemisfericidad"
            element={
              <RutaProtegida>
                <HemisfericidadPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pacientes/:dni/radiografias"
            element={
              <RutaProtegida>
                <RadiografiasPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pacientes/:dni/seguimiento"
            element={
              <RutaProtegida>
                <SeguimientoPage />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
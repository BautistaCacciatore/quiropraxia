import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si venías de una ruta protegida (te redirigió acá), después de
  // loguearte te devuelve ahí. Si no, va directo a /pacientes.
  const destino = location.state?.from?.pathname || "/pacientes";

  async function manejarEnvio(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await iniciarSesion(usuario, contrasena);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-login">
      <form className="tarjeta-login" onSubmit={manejarEnvio}>
        <h1>Quiropraxia</h1>
        <p className="subtitulo">Iniciá sesión para continuar</p>

        {error && <p className="mensaje-error">{error}</p>}

        <label>
          Usuario
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoFocus
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn-primario" disabled={enviando}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
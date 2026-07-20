import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPaciente } from "../api/pacientes";
import { obtenerSeguimiento, guardarSeguimiento } from "../api/seguimiento";
import SeguimientoTabla, { FILAS_INICIALES } from "../components/SeguimientoTabla";
import "../styles/SeguimientoTabla.css";

export default function SeguimientoPage() {
  const { dni } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [filas, setFilas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exitoso, setExitoso] = useState(false);

  useEffect(() => {
    Promise.all([
      obtenerPaciente(dni).then(setPaciente),
      obtenerSeguimiento(dni)
        .then((data) => setFilas(data.filas))
        .catch(() => setFilas(FILAS_INICIALES)),
    ]).finally(() => setCargando(false));
  }, [dni]);

  async function manejarGuardar() {
    setGuardando(true);
    setError(null);
    setExitoso(false);
    try {
      await guardarSeguimiento(dni, filas);
      setExitoso(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="estado-cargando">Cargando seguimiento...</p>;
  }

  return (
    <div className="pagina-seguimiento">
      <div className="encabezado-pagina">
        <div>
          <h2>Seguimiento</h2>
          {paciente && (
            <p className="subtitulo">
              {paciente.apellido}, {paciente.nombre} — DNI {dni}
            </p>
          )}
        </div>
        <div className="acciones-seguimiento">
          <button type="button" className="btn-secundario" onClick={() => navigate("/pacientes")}>
            Volver
          </button>
          <button type="button" className="btn-primario" onClick={manejarGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {error && <p className="mensaje-error">{error}</p>}
      {exitoso && <p className="mensaje-exito">Seguimiento guardado correctamente.</p>}

      <SeguimientoTabla filas={filas} onChange={setFilas} />
    </div>
  );
}

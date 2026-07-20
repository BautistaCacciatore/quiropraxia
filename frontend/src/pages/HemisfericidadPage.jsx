import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPaciente, actualizarPaciente } from "../api/pacientes";
import { calcularResultado } from "../api/hemisfericidad";
import HemisfericidadExamen from "../components/HemisfericidadExamen";

export default function HemisfericidadPage() {
  const { dni } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [valores, setValores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exitoso, setExitoso] = useState(false);

  useEffect(() => {
    obtenerPaciente(dni)
      .then((p) => {
        setPaciente(p);
        setValores(p.hemisfericidad_examen || {});
      })
      .finally(() => setCargando(false));
  }, [dni]);

  function actualizarValor(clave, valor) {
    setValores((prev) => ({ ...prev, [clave]: valor }));
  }

  async function manejarGuardar() {
    setGuardando(true);
    setError(null);
    setExitoso(false);
    try {
      await actualizarPaciente(dni, { hemisfericidad_examen: valores });
      setExitoso(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="estado-cargando">Cargando...</p>;
  }

  return (
    <div className="pagina-seguimiento">
      <div className="encabezado-pagina">
        <div>
          <h2>Examen de Hemisfericidad</h2>
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
      {exitoso && <p className="mensaje-exito">Hemisfericidad guardada correctamente.</p>}

      <HemisfericidadExamen valores={valores} onCambiar={actualizarValor} />
    </div>
  );
}

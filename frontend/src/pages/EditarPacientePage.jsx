import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PacienteForm from "../components/PacienteForm";
import { obtenerPaciente, actualizarPaciente } from "../api/pacientes";

export default function EditarPacientePage() {
  const { dni } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    obtenerPaciente(dni)
      .then(setPaciente)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [dni]);

  async function manejarGuardar(dniEditado, datos) {
    await actualizarPaciente(dniEditado, datos);
    navigate("/pacientes");
  }

  if (cargando) {
    return <p className="estado-cargando">Cargando paciente...</p>;
  }

  if (error) {
    return <p className="mensaje-error">{error}</p>;
  }

  return (
    <div className="pagina-formulario">
      <header className="encabezado-pagina">
        <div>
          <h1>Editar paciente</h1>
          <p className="subtitulo">
            {paciente.nombre} {paciente.apellido} — DNI {paciente.dni}
          </p>
        </div>
      </header>

      <PacienteForm pacienteInicial={paciente} onGuardar={manejarGuardar} onCancelar={() => navigate("/pacientes")} />
    </div>
  );
}
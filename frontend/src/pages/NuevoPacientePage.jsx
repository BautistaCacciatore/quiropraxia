import { useNavigate } from "react-router-dom";
import PacienteForm from "../components/PacienteForm";
import { crearPaciente } from "../api/pacientes";

export default function NuevoPacientePage() {
  const navigate = useNavigate();

  async function manejarGuardar(datos) {
    await crearPaciente(datos);
    navigate("/pacientes");
  }

  return (
    <div className="pagina-formulario">
      <header className="encabezado-pagina">
        <div>
          <h1>Nuevo paciente</h1>
          <p className="subtitulo">Completá todos los datos disponibles de la ficha.</p>
        </div>
      </header>

      <PacienteForm onGuardar={manejarGuardar} onCancelar={() => navigate("/pacientes")} />
    </div>
  );
}
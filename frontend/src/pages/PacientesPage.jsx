import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../hooks/usePacientes";
import PacienteTabla from "../components/PacienteTabla";
import ConfirmarEliminar from "../components/ConfirmarEliminar";
import "../styles/PacientesPage.css";

export default function PacientesPage() {
  const { pacientes, cargando, error, buscar, eliminar } = usePacientes();
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const navigate = useNavigate();

  async function confirmarEliminacion(paciente) {
    await eliminar(paciente.dni);
    setPacienteAEliminar(null);
  }

  function manejarBusqueda(e) {
    e.preventDefault();
    buscar(textoBusqueda);
  }

  return (
    <div className="pagina-pacientes">
      <header className="encabezado-pagina">
        <div>
          <h1>Pacientes</h1>
          <p className="subtitulo">Historial y datos de contacto del estudio.</p>
        </div>
        <button className="btn-primario" onClick={() => navigate("/pacientes/nuevo")}>
          + Nuevo paciente
        </button>
      </header>

      <form className="barra-busqueda" onSubmit={manejarBusqueda}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
        />
        <button type="submit" className="btn-secundario">
          Buscar
        </button>
      </form>

      {error && <p className="mensaje-error">{error}</p>}

      {cargando ? (
        <p className="estado-cargando">Cargando pacientes...</p>
      ) : (
        <PacienteTabla
          pacientes={pacientes}
          onEditar={(p) => navigate(`/pacientes/${p.dni}/editar`)}
          onEliminar={setPacienteAEliminar}
        />
      )}

      <ConfirmarEliminar
        paciente={pacienteAEliminar}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setPacienteAEliminar(null)}
      />
    </div>
  );
}
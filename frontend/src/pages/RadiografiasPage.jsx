import { useParams, useNavigate } from "react-router-dom";
import RadiografiasPaciente from "../components/RadiografiasPaciente";

export default function RadiografiasPage() {
  const { dni } = useParams();
  const navigate = useNavigate();

  return (
    <div className="pagina-seguimiento">
      <div className="encabezado-pagina">
        <div>
          <h2>Radiografías</h2>
          <p className="subtitulo">Paciente DNI {dni}</p>
        </div>
        <div className="acciones-seguimiento">
          <button type="button" className="btn-secundario" onClick={() => navigate("/pacientes")}>
            Volver
          </button>
        </div>
      </div>

      <RadiografiasPaciente dni={dni} />
    </div>
  );
}

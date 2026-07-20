import "../styles/PacienteTabla.css";

export default function PacienteTabla({ pacientes, onEditar, onEliminar, onSeguimiento, onHemisfericidad, onRadiografias }) {
  if (pacientes.length === 0) {
    return (
      <div className="estado-vacio">
        <p>Todavía no hay pacientes registrados.</p>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla-pacientes">
        <thead>
          <tr>
            <th>Apellido y nombre</th>
            <th>DNI</th>
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.dni}>
              <td>
                {p.apellido}, {p.nombre}
              </td>
              <td>{p.dni}</td>
              <td className="acciones">
                <button className="btn-texto" onClick={() => onEditar(p)}>
                  Editar
                </button>
                {onHemisfericidad && (
                  <button className="btn-texto" onClick={() => onHemisfericidad(p)}>
                    Hemisfericidad
                  </button>
                )}
                {onRadiografias && (
                  <button className="btn-texto" onClick={() => onRadiografias(p)}>
                    Radiografías
                  </button>
                )}
                {onSeguimiento && (
                  <button className="btn-texto" onClick={() => onSeguimiento(p)}>
                    Seguimiento
                  </button>
                )}
                <button className="btn-texto btn-texto-peligro" onClick={() => onEliminar(p)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
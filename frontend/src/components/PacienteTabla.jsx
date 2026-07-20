import "../styles/PacienteTabla.css";

export default function PacienteTabla({ pacientes, onEditar, onEliminar, onSeguimiento }) {
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
            <th>Edad</th>
            <th>Teléfono</th>
            <th>Ocupación</th>
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
              <td>{p.edad}</td>
              <td>{p.telefono || "—"}</td>
              <td>{p.ocupacion || "—"}</td>
              <td className="acciones">
                <button className="btn-texto" onClick={() => onEditar(p)}>
                  Editar
                </button>
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
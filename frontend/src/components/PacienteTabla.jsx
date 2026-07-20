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
            <th>Edad</th>
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.dni}>
              <td>{p.apellido}, {p.nombre}</td>
              <td>{p.dni}</td>
              <td>{p.edad}</td>
              <td className="acciones">
                <button className="btn-accion btn-accion-seguimiento" onClick={() => onSeguimiento?.(p)}>
                  Seguimiento
                </button>
                <button className="btn-accion btn-accion-radiografia" onClick={() => onRadiografias?.(p)}>
                  Radiografías
                </button>
                <button className="btn-accion btn-accion-hemisfericidad" onClick={() => onHemisfericidad?.(p)}>
                  Hemisfericidad
                </button>
                <button className="btn-accion btn-accion-editar" onClick={() => onEditar(p)}>
                  Editar
                </button>
                <button className="btn-accion btn-accion-eliminar" onClick={() => onEliminar(p)}>
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

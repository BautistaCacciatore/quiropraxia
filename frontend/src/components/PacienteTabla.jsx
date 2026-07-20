import "../styles/PacienteTabla.css";

const CELDAS_HEMI = [
  { key: "corteza_derecha", label: "C. Der" },
  { key: "corteza_izquierda", label: "C. Izq" },
  { key: "cerebelo_derecho", label: "Ce. Der" },
  { key: "cerebelo_izquierdo", label: "Ce. Izq" },
  { key: "tallo_derecho", label: "T. Der" },
  { key: "tallo_izquierdo", label: "T. Izq" },
  { key: "lado_ajuste", label: "Ajuste" },
];

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
            {CELDAS_HEMI.map((c) => (
              <th key={c.key} className="th-hemi">{c.label}</th>
            ))}
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => {
            const r = p.hemisfericidad_resultado;
            return (
              <tr key={p.dni}>
                <td>{p.apellido}, {p.nombre}</td>
                <td>{p.dni}</td>
                {CELDAS_HEMI.map((c) => (
                  <td key={c.key} className="td-hemi">{r?.[c.key] ?? "—"}</td>
                ))}
                <td className="acciones">
                  <button className="btn-accion btn-accion-seguimiento" onClick={() => onSeguimiento?.(p)}>
                    Seguimiento
                  </button>
                  <button className="btn-accion btn-accion-radiografia" onClick={() => onRadiografias?.(p)}>
                    Radiografías
                  </button>
                  <button className="btn-accion btn-accion-hemisfericidad" onClick={() => onHemisfericidad?.(p)}>
                    {r ? "Hemisfericidad" : "Calcular"}
                  </button>
                  <button className="btn-accion btn-accion-editar" onClick={() => onEditar(p)}>
                    Editar
                  </button>
                  <button className="btn-accion btn-accion-eliminar" onClick={() => onEliminar(p)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

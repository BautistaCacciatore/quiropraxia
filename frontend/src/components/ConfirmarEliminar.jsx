import "../styles/ConfirmarEliminar.css";

export default function ConfirmarEliminar({ paciente, onConfirmar, onCancelar }) {
  if (!paciente) return null;

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true">
      <div className="modal-caja modal-chica">
        <h3>¿Eliminar paciente?</h3>
        <p>
          Vas a eliminar a <strong>{paciente.nombre} {paciente.apellido}</strong> (DNI {paciente.dni}).
          Esta acción no se puede deshacer.
        </p>
        <div className="acciones-formulario">
          <button className="btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn-peligro" onClick={() => onConfirmar(paciente)}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
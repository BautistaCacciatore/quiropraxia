export default function ConfirmarEliminar({ paciente, onConfirmar, onCancelar, radiografia }) {
  if (!paciente && !radiografia) return null;

  const esPaciente = Boolean(paciente);

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true">
      <div className="modal-caja modal-chica">
        {esPaciente ? (
          <>
            <h3>Eliminar paciente</h3>
            <p>
              Vas a eliminar a <strong>{paciente.nombre} {paciente.apellido}</strong> (DNI {paciente.dni}).
              Esta acción no se puede deshacer.
            </p>
          </>
        ) : (
          <>
            <h3>Eliminar radiografía</h3>
            <p>
              Vas a eliminar <strong>{radiografia.titulo}</strong>.
              Esta acción no se puede deshacer.
            </p>
          </>
        )}
        <div className="acciones-formulario">
          <button className="btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn-peligro" onClick={() => onConfirmar(esPaciente ? paciente : radiografia)}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
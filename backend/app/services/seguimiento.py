from app.db.database import obtener_sesion
from app.models.seguimiento import Seguimiento
from app.models.paciente import Paciente
from app.exceptions.exceptions import PacienteNoEncontrado, SeguimientoNoEncontrado


def obtener_seguimiento(paciente_id: int) -> Seguimiento:
    sesion = obtener_sesion()
    try:
        seguimiento = sesion.query(Seguimiento).filter_by(paciente_id=paciente_id).first()
        if not seguimiento:
            raise SeguimientoNoEncontrado(
                f"No hay seguimiento para el paciente {paciente_id}"
            )
        return seguimiento
    finally:
        sesion.close()


def crear_o_actualizar_seguimiento(paciente_id: int, filas: list[dict]) -> Seguimiento:
    sesion = obtener_sesion()
    try:
        paciente = sesion.query(Paciente).filter_by(id=paciente_id).first()
        if not paciente:
            raise PacienteNoEncontrado(f"No se encontró el paciente {paciente_id}")

        seguimiento = sesion.query(Seguimiento).filter_by(paciente_id=paciente_id).first()
        if seguimiento:
            seguimiento.filas = filas
        else:
            seguimiento = Seguimiento(paciente_id=paciente_id, filas=filas)
            sesion.add(seguimiento)

        sesion.commit()
        sesion.refresh(seguimiento)
        return seguimiento
    finally:
        sesion.close()

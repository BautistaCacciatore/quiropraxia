"""
Operaciones sobre pacientes: crear, buscar, listar, actualizar, eliminar.

Recibe y valida datos usando los schemas de Pydantic (app/schemas),
persiste usando el modelo ORM (app/models), y lanza excepciones propias
(app/exceptions) cuando algo no corresponde.
"""

from app.db.database import obtener_sesion
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate
from app.exceptions.exceptions import PacienteYaExiste, PacienteNoEncontrado


def crear_paciente(datos: PacienteCreate) -> Paciente:
    """Registra un nuevo paciente. Falla si el DNI ya existe."""
    sesion = obtener_sesion()
    try:
        existente = sesion.query(Paciente).filter_by(dni=datos.dni).first()
        if existente:
            raise PacienteYaExiste(f"Ya existe un paciente con DNI {datos.dni}")

        nuevo = Paciente(**datos.model_dump())
        sesion.add(nuevo)
        sesion.commit()
        sesion.refresh(nuevo)
        return nuevo
    finally:
        sesion.close()


def obtener_paciente_por_dni(dni: str) -> Paciente:
    """Busca un paciente por DNI. Lanza error si no existe."""
    sesion = obtener_sesion()
    try:
        paciente = sesion.query(Paciente).filter_by(dni=dni).first()
        if not paciente:
            raise PacienteNoEncontrado(f"No se encontró un paciente con DNI {dni}")
        return paciente
    finally:
        sesion.close()


def listar_pacientes(orden_por: str = "apellido") -> list[Paciente]:
    """Devuelve todos los pacientes ordenados por el campo indicado."""
    sesion = obtener_sesion()
    try:
        columna = getattr(Paciente, orden_por, Paciente.apellido)
        return sesion.query(Paciente).order_by(columna).all()
    finally:
        sesion.close()


def buscar_pacientes(texto: str) -> list[Paciente]:
    """Busca pacientes cuyo nombre, apellido o DNI contengan el texto dado."""
    sesion = obtener_sesion()
    try:
        patron = f"%{texto}%"
        return (
            sesion.query(Paciente)
            .filter(
                (Paciente.nombre.ilike(patron))
                | (Paciente.apellido.ilike(patron))
                | (Paciente.dni.ilike(patron))
            )
            .all()
        )
    finally:
        sesion.close()


def actualizar_paciente(dni: str, datos: PacienteUpdate) -> Paciente:
    """Actualiza solo los campos enviados (los que no se mandan, no se tocan)."""
    sesion = obtener_sesion()
    try:
        paciente = sesion.query(Paciente).filter_by(dni=dni).first()
        if not paciente:
            raise PacienteNoEncontrado(f"No se encontró un paciente con DNI {dni}")

        cambios = datos.model_dump(exclude_unset=True)  # solo lo que vino en la petición
        for campo, valor in cambios.items():
            setattr(paciente, campo, valor)

        sesion.commit()
        sesion.refresh(paciente)
        return paciente
    finally:
        sesion.close()


def eliminar_paciente(dni: str) -> None:
    """Elimina un paciente por su DNI."""
    sesion = obtener_sesion()
    try:
        paciente = sesion.query(Paciente).filter_by(dni=dni).first()
        if not paciente:
            raise PacienteNoEncontrado(f"No se encontró un paciente con DNI {dni}")
        sesion.delete(paciente)
        sesion.commit()
    finally:
        sesion.close()

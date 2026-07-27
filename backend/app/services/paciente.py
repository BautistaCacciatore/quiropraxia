"""
Operaciones sobre pacientes: crear, buscar, listar, actualizar, eliminar.

Recibe y valida datos usando los schemas de Pydantic (app/schemas),
persiste usando el modelo ORM (app/models), y lanza excepciones propias
(app/exceptions) cuando algo no corresponde.
"""

import base64

from app.db.database import obtener_sesion
from app.models.paciente import Paciente
from app.models.seguimiento import Seguimiento
from app.schemas.paciente import PacienteCreate, PacienteUpdate
from app.exceptions.exceptions import PacienteYaExiste, PacienteNoEncontrado
from app.services import almacenamiento


def _subir_diagrama(diagrama_corporal: str) -> str:
    """Sube un diagrama corporal (base64 PNG) a B2 y devuelve la ruta."""
    if "," in diagrama_corporal:
        _, base64_data = diagrama_corporal.split(",", 1)
    else:
        base64_data = diagrama_corporal
    contenido = base64.b64decode(base64_data)
    return almacenamiento.guardar_bytes(contenido, "image/png", subcarpeta="diagramas")


def _procesar_diagrama(datos_dict: dict, ruta_anterior: str | None = None) -> None:
    """Si datos_dict trae diagrama_corporal, lo sube a B2 y guarda la ruta."""
    diagrama = datos_dict.pop("diagrama_corporal", None)
    if not diagrama:
        return
    if ruta_anterior:
        almacenamiento.eliminar_archivo(ruta_anterior)
    ruta = _subir_diagrama(diagrama)
    datos_dict["diagrama_corporal_ruta"] = ruta


def crear_paciente(datos: PacienteCreate) -> Paciente:
    """Registra un nuevo paciente. Falla si el DNI ya existe."""
    sesion = obtener_sesion()
    try:
        existente = sesion.query(Paciente).filter_by(dni=datos.dni).first()
        if existente:
            raise PacienteYaExiste(f"Ya existe un paciente con DNI {datos.dni}")

        datos_dict = datos.model_dump()
        _procesar_diagrama(datos_dict)
        nuevo = Paciente(**datos_dict)
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
        _procesar_diagrama(cambios, ruta_anterior=paciente.diagrama_corporal_ruta)
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

        # Limpiar archivos en B2
        for r in paciente.radiografias:
            if r.ruta_archivo:
                try:
                    almacenamiento.eliminar_archivo(r.ruta_archivo)
                except Exception:
                    pass  # no bloquear la eliminación si falla B2
        if paciente.diagrama_corporal_ruta:
            try:
                almacenamiento.eliminar_archivo(paciente.diagrama_corporal_ruta)
            except Exception:
                pass

        # Eliminar seguimiento si existe (no hay cascade en la FK)
        seguimiento = sesion.query(Seguimiento).filter_by(paciente_id=paciente.id).first()
        if seguimiento:
            sesion.delete(seguimiento)

        sesion.delete(paciente)
        sesion.commit()
    finally:
        sesion.close()

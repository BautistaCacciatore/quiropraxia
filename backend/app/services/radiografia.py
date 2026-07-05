from datetime import date
from fastapi import UploadFile

from app.db.database import obtener_sesion
from app.models.radiografia import Radiografia
from app.exceptions.exceptions import RadiografiaNoEncontrada
from app.services import almacenamiento


def crear_radiografia(
    paciente_id: int,
    titulo: str,
    fecha: date,
    descripcion: str,
    archivo: UploadFile,
) -> Radiografia:
    ruta_relativa, nombre_original, tipo_mime = almacenamiento.guardar_archivo(
        archivo, subcarpeta="radiografias"
    )

    sesion = obtener_sesion()
    try:
        nueva = Radiografia(
            paciente_id=paciente_id,
            titulo=titulo,
            fecha=fecha,
            descripcion=descripcion,
            nombre_archivo=nombre_original,
            ruta_archivo=ruta_relativa,
            tipo_archivo=tipo_mime,
        )
        sesion.add(nueva)
        sesion.commit()
        sesion.refresh(nueva)
        return nueva
    finally:
        sesion.close()


def listar_radiografias(paciente_id: int) -> list[Radiografia]:
    sesion = obtener_sesion()
    try:
        return (
            sesion.query(Radiografia)
            .filter_by(paciente_id=paciente_id)
            .order_by(Radiografia.fecha.desc())
            .all()
        )
    finally:
        sesion.close()


def obtener_radiografia(radiografia_id: int) -> Radiografia:
    sesion = obtener_sesion()
    try:
        radiografia = sesion.query(Radiografia).filter_by(id=radiografia_id).first()
        if not radiografia:
            raise RadiografiaNoEncontrada(f"No se encontró la radiografía {radiografia_id}")
        return radiografia
    finally:
        sesion.close()


def eliminar_radiografia(radiografia_id: int) -> None:
    sesion = obtener_sesion()
    try:
        radiografia = sesion.query(Radiografia).filter_by(id=radiografia_id).first()
        if not radiografia:
            raise RadiografiaNoEncontrada(f"No se encontró la radiografía {radiografia_id}")
        # Primero el archivo físico, después el registro en la base.
        almacenamiento.eliminar_archivo(radiografia.ruta_archivo)
        sesion.delete(radiografia)
        sesion.commit()
    finally:
        sesion.close()
"""
Abstracción de almacenamiento de archivos.

Esta es la ÚNICA parte del sistema que sabe dónde viven físicamente
los archivos subidos (hoy: una carpeta en este servidor). El resto del
código (rutas, servicios) solo llama a estas funciones — no le importa
si por dentro se guarda en disco o en la nube.

El día de mañana que se migre a un servicio como Amazon S3, el cambio
se limita a reescribir el contenido de estas tres funciones. Todo lo
demás (modelos, rutas, frontend) sigue funcionando igual.
"""

import os
import uuid
from pathlib import Path
from fastapi import UploadFile

from app.core.config import settings
from app.exceptions.exceptions import ArchivoInvalido

# Carpeta base, relativa a donde se ejecuta uvicorn (backend/).
_CARPETA_BASE = Path(settings.UPLOADS_DIR)


def guardar_archivo(archivo: UploadFile, subcarpeta: str) -> tuple[str, str, str]:
    """
    Guarda un archivo subido y devuelve (ruta_relativa, nombre_original, tipo_mime).

    ruta_relativa es lo que se guarda en la base de datos — un identificador
    opaco para el resto del sistema, no necesariamente un path de disco.
    """
    if archivo.content_type not in settings.TIPOS_ARCHIVO_PERMITIDOS:
        raise ArchivoInvalido(
            f"Tipo de archivo no permitido: {archivo.content_type}. "
            f"Permitidos: PDF, JPG, PNG."
        )

    contenido = archivo.file.read()
    if len(contenido) > settings.TAMANO_MAXIMO_ARCHIVO:
        raise ArchivoInvalido("El archivo supera el tamaño máximo permitido (15 MB).")

    carpeta_destino = _CARPETA_BASE / subcarpeta
    carpeta_destino.mkdir(parents=True, exist_ok=True)

    extension = Path(archivo.filename).suffix
    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    ruta_completa = carpeta_destino / nombre_unico

    with open(ruta_completa, "wb") as f:
        f.write(contenido)

    ruta_relativa = str(Path(subcarpeta) / nombre_unico)
    return ruta_relativa, archivo.filename, archivo.content_type


def ruta_absoluta(ruta_relativa: str) -> Path:
    """Devuelve la ubicación real en disco a partir de la ruta guardada en la base."""
    return _CARPETA_BASE / ruta_relativa


def eliminar_archivo(ruta_relativa: str) -> None:
    """Borra el archivo físico. No falla si ya no existe."""
    ruta = ruta_absoluta(ruta_relativa)
    if ruta.exists():
        os.remove(ruta)
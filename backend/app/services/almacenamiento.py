"""
Abstracción de almacenamiento de archivos en Backblaze B2.

Usa la API S3-compatible de B2 a través de boto3.
"""

import uuid
from pathlib import Path
import boto3
from botocore.config import Config as BotoConfig
from fastapi import UploadFile

from app.core.config import settings
from app.exceptions.exceptions import ArchivoInvalido

_s3 = None


def _get_s3():
    global _s3
    if _s3 is None:
        _s3 = boto3.client(
            "s3",
            endpoint_url=settings.B2_ENDPOINT,
            aws_access_key_id=settings.B2_KEY_ID,
            aws_secret_access_key=settings.B2_APPLICATION_KEY,
            config=BotoConfig(signature_version="s3v4"),
        )
    return _s3


def guardar_archivo(archivo: UploadFile, subcarpeta: str) -> tuple[str, str, str]:
    """
    Sube un archivo a Backblaze B2 y devuelve (ruta_en_b2, nombre_original, tipo_mime).

    ruta_en_b2 es el object key (ej: "radiografias/{uuid}.pdf").
    """
    if archivo.content_type not in settings.TIPOS_ARCHIVO_PERMITIDOS:
        raise ArchivoInvalido(
            f"Tipo de archivo no permitido: {archivo.content_type}. "
            f"Permitidos: PDF, JPG, PNG."
        )

    contenido = archivo.file.read()
    if len(contenido) > settings.TAMANO_MAXIMO_ARCHIVO:
        raise ArchivoInvalido("El archivo supera el tamaño máximo permitido (15 MB).")

    extension = Path(archivo.filename).suffix
    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    ruta_relativa = f"{subcarpeta}/{nombre_unico}"

    s3 = _get_s3()
    s3.put_object(
        Bucket=settings.B2_BUCKET_NAME,
        Key=ruta_relativa,
        Body=contenido,
        ContentType=archivo.content_type,
    )

    return ruta_relativa, archivo.filename, archivo.content_type


def ruta_absoluta(ruta_relativa: str, descargar: bool = False, filename: str | None = None) -> str:
    """Devuelve una URL firmada temporal para ver (inline) o descargar (attachment) el archivo."""
    params = {"Bucket": settings.B2_BUCKET_NAME, "Key": ruta_relativa}
    if descargar:
        if filename:
            params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'
        else:
            params["ResponseContentDisposition"] = "attachment"
    s3 = _get_s3()
    url = s3.generate_presigned_url(
        "get_object",
        Params=params,
        ExpiresIn=3600,
    )
    return url


def eliminar_archivo(ruta_relativa: str) -> None:
    """Borra el archivo de B2."""
    s3 = _get_s3()
    s3.delete_object(Bucket=settings.B2_BUCKET_NAME, Key=ruta_relativa)

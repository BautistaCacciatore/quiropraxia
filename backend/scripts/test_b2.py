"""Prueba de conexión a Backblaze B2."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.almacenamiento import _get_s3, guardar_archivo, ruta_absoluta, eliminar_archivo
from app.core.config import settings
from io import BytesIO

s3 = _get_s3()
print(f"Conectado a bucket: {settings.B2_BUCKET_NAME}")

# Probar subida
s3.put_object(
    Bucket=settings.B2_BUCKET_NAME,
    Key="test/hola-mundo.txt",
    Body=b"Hola mundo desde quiropraxia!",
    ContentType="text/plain",
)
print("Subida OK")

# Probar URL firmada
url = ruta_absoluta("test/hola-mundo.txt")
print(f"URL firmada: {url}")

# Probar descarga
import requests
r = requests.get(url)
print(f"Descarga: status={r.status_code}, contenido={r.text}")

# Probar eliminación
eliminar_archivo("test/hola-mundo.txt")
print("Eliminado OK")
print("Todo funciona!")

"""
Endpoints de radiografías.

La creación recibe un formulario multipart (no JSON), porque incluye
un archivo. Por eso acá se usan Form(...) y File(...) en vez de un
schema Pydantic como en pacientes.py.
"""

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile
from fastapi.responses import FileResponse

from app.schemas.radiografia import RadiografiaOut
from app.exceptions.exceptions import PacienteNoEncontrado, RadiografiaNoEncontrada, ArchivoInvalido
from app.services import radiografia as radiografia_service
from app.services.paciente import obtener_paciente_por_dni
from app.services import almacenamiento
from app.core.dependencies import requiere_autenticacion

# Rutas anidadas bajo un paciente: crear y listar sus radiografías.
router_paciente = APIRouter(
    prefix="/pacientes/{dni}/radiografias",
    tags=["Radiografías"],
    dependencies=[Depends(requiere_autenticacion)],
)

# Rutas sueltas por id: ver el archivo y eliminar (no necesitan el DNI).
router_radiografia = APIRouter(
    prefix="/radiografias",
    tags=["Radiografías"],
    dependencies=[Depends(requiere_autenticacion)],
)


@router_paciente.post("", response_model=RadiografiaOut, status_code=201)
def crear_radiografia(
    dni: str,
    titulo: str = Form(...),
    fecha: date = Form(...),
    descripcion: Optional[str] = Form(None),
    archivo: UploadFile = File(...),
):
    try:
        paciente = obtener_paciente_por_dni(dni)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))

    try:
        return radiografia_service.crear_radiografia(
            paciente_id=paciente.id,
            titulo=titulo,
            fecha=fecha,
            descripcion=descripcion,
            archivo=archivo,
        )
    except ArchivoInvalido as e:
        raise HTTPException(status_code=400, detail=str(e))


@router_paciente.get("", response_model=List[RadiografiaOut])
def listar_radiografias_de_paciente(dni: str):
    try:
        paciente = obtener_paciente_por_dni(dni)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))

    return radiografia_service.listar_radiografias(paciente.id)


@router_radiografia.get("/{radiografia_id}/archivo")
def descargar_archivo(radiografia_id: int, descargar: bool = False):
    try:
        radiografia = radiografia_service.obtener_radiografia(radiografia_id)
    except RadiografiaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))

    ruta = almacenamiento.ruta_absoluta(radiografia.ruta_archivo)
    if not ruta.exists():
        raise HTTPException(status_code=404, detail="El archivo ya no existe en el servidor")

    # "inline" = el navegador lo muestra directo (imagen o PDF embebido).
    # "attachment" = fuerza la descarga real. Por defecto, inline —
    # así funciona tanto para la vista previa como para abrir en pestaña.
    disposicion = "attachment" if descargar else "inline"
    return FileResponse(
        path=ruta,
        media_type=radiografia.tipo_archivo,
        filename=radiografia.nombre_archivo,
        content_disposition_type=disposicion,
    )


@router_radiografia.delete("/{radiografia_id}", status_code=204)
def eliminar_radiografia(radiografia_id: int):
    try:
        radiografia_service.eliminar_radiografia(radiografia_id)
    except RadiografiaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))
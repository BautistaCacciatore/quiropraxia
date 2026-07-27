"""
Endpoints de radiografías.

La creación recibe un formulario multipart (no JSON), porque incluye
un archivo. Por eso acá se usan Form(...) y File(...) en vez de un
schema Pydantic como en pacientes.py.
"""

from datetime import date
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile
from fastapi.responses import RedirectResponse

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
# La descarga (GET /archivo) NO lleva auth porque el navegador no envía
# headers personalizados en <img src>, <iframe src> ni <a href>.
# La URL firmada de B2 ya expira en 1 hora.
router_radiografia = APIRouter(
    prefix="/radiografias",
    tags=["Radiografías"],
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

    dni = radiografia.paciente.dni if radiografia.paciente else "desconocido"
    nombre_doc = radiografia.nombre_archivo or "archivo"
    ext = Path(nombre_doc).suffix
    titulo_limpio = "".join(c for c in radiografia.titulo if c.isalnum() or c in " _-").strip().replace(" ", "_") or "sin_titulo"
    filename = f"{dni}_{titulo_limpio}{ext}" if descargar else None

    url = almacenamiento.ruta_absoluta(radiografia.ruta_archivo, descargar=descargar, filename=filename)
    return RedirectResponse(url=url)


@router_radiografia.delete("/{radiografia_id}", status_code=204, dependencies=[Depends(requiere_autenticacion)])
def eliminar_radiografia(radiografia_id: int):
    try:
        radiografia_service.eliminar_radiografia(radiografia_id)
    except RadiografiaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))
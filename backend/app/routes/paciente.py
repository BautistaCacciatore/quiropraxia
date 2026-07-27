"""
Endpoints HTTP para pacientes.

Cada función acá es una URL real que se puede llamar por HTTP.
No tiene lógica propia: solo traduce pedidos HTTP a llamadas de
app/services/crud.py, y traduce las excepciones propias del negocio
a códigos de error HTTP estándar (404, 409, etc.).
"""

from typing import List
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import Response

from app.schemas.paciente import PacienteCreate, PacienteUpdate, PacienteOut
from app.exceptions.exceptions import PacienteYaExiste, PacienteNoEncontrado
from app.services import paciente, almacenamiento
from app.core.dependencies import requiere_autenticacion

# dependencies=[...] acá aplica el chequeo de sesión a TODOS los endpoints
# de este router de una sola vez, sin repetirlo en cada función.
router = APIRouter(prefix="/pacientes", tags=["Pacientes"], dependencies=[Depends(requiere_autenticacion)])


@router.post("", response_model=PacienteOut, status_code=201)
def crear_paciente(datos: PacienteCreate):
    """Registra un nuevo paciente."""
    try:
        return paciente.crear_paciente(datos)
    except PacienteYaExiste as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("", response_model=List[PacienteOut])
def listar_pacientes(orden_por: str = "apellido"):
    """Devuelve todos los pacientes."""
    return paciente.listar_pacientes(orden_por=orden_por)


@router.get("/buscar", response_model=List[PacienteOut])
def buscar_pacientes(q: str = Query(..., min_length=1, description="Texto a buscar en nombre, apellido o DNI")):
    """Busca pacientes por coincidencia parcial de texto."""
    return paciente.buscar_pacientes(q)


@router.get("/{dni}", response_model=PacienteOut)
def obtener_paciente(dni: str):
    """Busca un paciente puntual por DNI."""
    try:
        return paciente.obtener_paciente_por_dni(dni)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{dni}", response_model=PacienteOut)
def actualizar_paciente(dni: str, datos: PacienteUpdate):
    """Actualiza uno o más campos de un paciente existente."""
    try:
        return paciente.actualizar_paciente(dni, datos)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{dni}", status_code=204)
def eliminar_paciente(dni: str):
    """Elimina un paciente."""
    try:
        paciente.eliminar_paciente(dni)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


# ---- Diagrama corporal (sin auth, lo carga el navegador en un <img>) ----

router_diagrama = APIRouter(prefix="/diagramas", tags=["Diagramas"])


@router_diagrama.get("/{dni}")
def obtener_diagrama(dni: str):
    """Devuelve la imagen del diagrama corporal del paciente."""
    try:
        p = paciente.obtener_paciente_por_dni(dni)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))

    if not p.diagrama_corporal_ruta:
        raise HTTPException(status_code=404, detail="El paciente no tiene diagrama corporal")

    contenido = almacenamiento.leer_archivo(p.diagrama_corporal_ruta)
    return Response(content=contenido, media_type="image/png")
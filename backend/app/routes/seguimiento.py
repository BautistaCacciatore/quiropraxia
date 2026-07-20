from fastapi import APIRouter, HTTPException, Depends

from app.schemas.seguimiento import SeguimientoUpdate, SeguimientoOut
from app.exceptions.exceptions import PacienteNoEncontrado, SeguimientoNoEncontrado
from app.services import seguimiento as seguimiento_service
from app.services.paciente import obtener_paciente_por_dni
from app.core.dependencies import requiere_autenticacion

router = APIRouter(
    prefix="/pacientes/{dni}/seguimiento",
    tags=["Seguimiento"],
    dependencies=[Depends(requiere_autenticacion)],
)


@router.get("", response_model=SeguimientoOut)
def obtener_seguimiento(dni: str):
    try:
        paciente = obtener_paciente_por_dni(dni)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))

    try:
        return seguimiento_service.obtener_seguimiento(paciente.id)
    except SeguimientoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("", response_model=SeguimientoOut)
def guardar_seguimiento(dni: str, datos: SeguimientoUpdate):
    try:
        paciente = obtener_paciente_por_dni(dni)
    except PacienteNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))

    return seguimiento_service.crear_o_actualizar_seguimiento(
        paciente.id, [f.model_dump() for f in datos.filas]
    )

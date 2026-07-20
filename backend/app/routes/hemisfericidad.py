"""
Endpoints de hemisfericidad. No tienen "paciente" en la URL porque no
guardan nada acá — /pruebas es un catálogo fijo, y /calcular es una
calculadora sin estado (el guardado real pasa por PATCH /pacientes/{dni},
igual que cualquier otro campo del paciente).
"""

from fastapi import APIRouter, Depends, Body

from app.core.dependencies import requiere_autenticacion
from app.services.hemisfericidad import listar_pruebas, calcular_resultado

router = APIRouter(prefix="/hemisfericidad", tags=["Hemisfericidad"], dependencies=[Depends(requiere_autenticacion)])


@router.get("/pruebas")
def obtener_pruebas():
    """Catálogo de las 21 pruebas, para que el frontend arme la tabla."""
    return listar_pruebas()


@router.post("/calcular")
def calcular(respuestas: dict = Body(...)):
    """
    Calcula los totales y el lado de ajuste sugerido a partir de las
    respuestas actuales, SIN guardar nada. Sirve para previsualizar
    el resultado mientras se completa el formulario.
    """
    return calcular_resultado(respuestas)
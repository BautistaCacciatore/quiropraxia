"""
Schemas de validación (Pydantic).

Estos NO son las tablas de la base (eso está en models/). Son la
"forma" que deben tener los datos cuando entran o salen del sistema.
Sirven para validar antes de tocar la base de datos, y van a ser
directamente reutilizables el día que conectes una API (FastAPI).
"""

from datetime import date, datetime
from typing import Optional, Dict
from pydantic import BaseModel, Field, computed_field

from app.services.hemisfericidad import calcular_resultado


class PacienteBase(BaseModel):
    """Campos comunes a creación y actualización."""
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    fecha_nacimiento: date
    telefono: Optional[str] = Field(default=None, max_length=30)
    ocupacion: Optional[str] = Field(default=None, max_length=150)
    recomendado: Optional[str] = Field(default=None, max_length=150)
    actividad_fisica: Optional[str] = Field(default=None, max_length=200)
    comentario: Optional[str] = None

    # --- Historia clínica ---
    razon_consulta: Optional[str] = None
    historia_clinica_familiar: Optional[str] = None
    historia_clinica_pasada: Optional[str] = None
    antecedentes_previos: Optional[str] = None
    estudios_previos: Optional[str] = None
    medicamentos: Optional[str] = None
    otros_datos: Optional[str] = None

    # --- Test de lateralidad de MMII y de inclinación lateral (examen físico) ---
    leg_check: Optional[str] = None
    nervoscope: Optional[str] = None
    visualizacion_frente: Optional[str] = None
    visualizacion_perfil: Optional[str] = None
    palpacion_estatica: Optional[str] = None
    palpacion_dinamica: Optional[str] = None
    diagrama_corporal: Optional[str] = None
    hemisfericidad_examen: Optional[Dict[str, str]] = None
    hemisfericidad_resultado_guardado: Optional[dict] = None


class PacienteCreate(PacienteBase):
    """Datos requeridos para registrar un paciente nuevo."""
    dni: str = Field(..., min_length=6, max_length=15, pattern=r"^\d+$")


class PacienteUpdate(BaseModel):
    """
    Datos para actualizar un paciente existente.
    Todos los campos son opcionales: solo se actualiza lo que se envía.
    """
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(default=None, min_length=1, max_length=100)
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = Field(default=None, max_length=30)
    ocupacion: Optional[str] = Field(default=None, max_length=150)
    recomendado: Optional[str] = Field(default=None, max_length=150)
    actividad_fisica: Optional[str] = Field(default=None, max_length=200)
    comentario: Optional[str] = None
    razon_consulta: Optional[str] = None
    historia_clinica_familiar: Optional[str] = None
    historia_clinica_pasada: Optional[str] = None
    antecedentes_previos: Optional[str] = None
    estudios_previos: Optional[str] = None
    medicamentos: Optional[str] = None
    otros_datos: Optional[str] = None
    leg_check: Optional[str] = None
    nervoscope: Optional[str] = None
    visualizacion_frente: Optional[str] = None
    visualizacion_perfil: Optional[str] = None
    palpacion_estatica: Optional[str] = None
    palpacion_dinamica: Optional[str] = None
    diagrama_corporal: Optional[str] = None
    hemisfericidad_examen: Optional[Dict[str, str]] = None
    hemisfericidad_resultado_guardado: Optional[dict] = None


class PacienteOut(PacienteBase):
    """Datos que se devuelven al consultar un paciente (incluye calculados)."""
    id: int
    dni: str
    edad: int
    fecha_registro: datetime

    class Config:
        from_attributes = True  # permite construir esto directo desde el modelo ORM

    @computed_field
    @property
    def hemisfericidad_resultado(self) -> Optional[dict]:
        """
        Totales por estructura + lado de ajuste sugerido.
        Si ya fue calculado y guardado en la BD, se usa ese valor.
        Si no, se calcula al vuelo desde hemisfericidad_examen.
        """
        guardado = getattr(self, "hemisfericidad_resultado_guardado", None)
        if guardado:
            return guardado
        if not self.hemisfericidad_examen:
            return None
        return calcular_resultado(self.hemisfericidad_examen)
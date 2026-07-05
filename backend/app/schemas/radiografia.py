from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class RadiografiaOut(BaseModel):
    id: int
    paciente_id: int
    titulo: str
    fecha: date
    descripcion: Optional[str] = None
    nombre_archivo: str
    tipo_archivo: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True
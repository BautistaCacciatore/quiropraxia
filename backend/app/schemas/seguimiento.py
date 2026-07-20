from typing import Optional
from pydantic import BaseModel


class FilaSeguimiento(BaseModel):
    fecha: Optional[str] = None
    c0: Optional[str] = None
    c1: Optional[str] = None
    c2: Optional[str] = None
    c3: Optional[str] = None
    c4: Optional[str] = None
    c5: Optional[str] = None
    c6: Optional[str] = None
    d0: Optional[str] = None
    d1: Optional[str] = None
    d2: Optional[str] = None
    d3: Optional[str] = None
    d4: Optional[str] = None
    d5: Optional[str] = None
    d6: Optional[str] = None
    d7: Optional[str] = None
    d8: Optional[str] = None
    d9: Optional[str] = None
    d10: Optional[str] = None
    d11: Optional[str] = None
    d12: Optional[str] = None
    l1: Optional[str] = None
    l2: Optional[str] = None
    l3: Optional[str] = None
    l4: Optional[str] = None
    l5: Optional[str] = None
    li: Optional[str] = None
    ld: Optional[str] = None
    s: Optional[str] = None
    c: Optional[str] = None


class SeguimientoUpdate(BaseModel):
    filas: list[FilaSeguimiento]


class SeguimientoOut(BaseModel):
    id: int
    paciente_id: int
    filas: list[FilaSeguimiento]

    class Config:
        from_attributes = True

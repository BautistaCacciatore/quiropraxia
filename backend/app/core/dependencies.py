"""
Dependencia de FastAPI para proteger rutas.

Se usa así en cualquier router que necesite requerir login:

    router = APIRouter(dependencies=[Depends(requiere_autenticacion)])

Lee el token de la cookie httpOnly (no de un header), valida que sea
un JWT correcto y no esté vencido, y si falla corta el pedido con 401
antes de que llegue a la lógica de negocio.
"""

from typing import Optional
from fastapi import Cookie, HTTPException, status

from app.core.security import decodificar_token

NOMBRE_COOKIE = "access_token"


def requiere_autenticacion(access_token: Optional[str] = Cookie(default=None, alias=NOMBRE_COOKIE)) -> dict:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")

    payload = decodificar_token(access_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o expirada")

    return payload
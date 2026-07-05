"""
Endpoints de autenticación. Deliberadamente NO existe un endpoint de
registro ni de cambio de contraseña: el usuario administrador se crea
por consola (ver scripts/crear_admin.py), nunca por HTTP.
"""

from fastapi import APIRouter, Response, HTTPException, Depends

from app.schemas.auth import LoginRequest
from app.services.auth import autenticar
from app.exceptions.exceptions import CredencialesInvalidas
from app.core.security import crear_token
from app.core.dependencies import requiere_autenticacion, NOMBRE_COOKIE

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login")
def login(datos: LoginRequest, response: Response):
    try:
        usuario = autenticar(datos.usuario, datos.contrasena)
    except CredencialesInvalidas as e:
        raise HTTPException(status_code=401, detail=str(e))

    token = crear_token({"sub": usuario.usuario, "id": usuario.id})

    response.set_cookie(
        key=NOMBRE_COOKIE,
        value=token,
        httponly=True,       # JavaScript no puede leer esta cookie
        samesite="lax",       # protección básica contra CSRF
        secure=False,          # poner en True cuando el sitio se sirva por HTTPS
        max_age=60 * 60 * 8,     # 8 horas, coincide con ACCESS_TOKEN_EXPIRE_MINUTES
        path="/",
    )
    return {"usuario": usuario.usuario}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(NOMBRE_COOKIE, path="/")
    return {"status": "ok"}


@router.get("/me")
def quien_soy(payload: dict = Depends(requiere_autenticacion)):
    """
    El frontend llama esto al cargar la página para saber si ya hay
    una sesión válida (cookie vigente) sin tener que loguearse de nuevo.
    """
    return {"usuario": payload.get("sub")}
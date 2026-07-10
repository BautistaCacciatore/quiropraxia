from fastapi import APIRouter, HTTPException, Depends

from app.schemas.auth import LoginRequest
from app.services.auth import autenticar
from app.exceptions.exceptions import CredencialesInvalidas
from app.core.security import crear_token
from app.core.dependencies import requiere_autenticacion

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login")
def login(datos: LoginRequest):
    try:
        usuario = autenticar(datos.usuario, datos.contrasena)
    except CredencialesInvalidas as e:
        raise HTTPException(status_code=401, detail=str(e))

    token = crear_token({"sub": usuario.usuario, "id": usuario.id})
    return {"usuario": usuario.usuario, "access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    return {"status": "ok"}


@router.get("/me")
def quien_soy(payload: dict = Depends(requiere_autenticacion)):
    return {"usuario": payload.get("sub")}

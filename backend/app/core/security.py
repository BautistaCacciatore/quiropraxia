from datetime import datetime, timedelta, timezone
import bcrypt
from jose import jwt, JWTError

from app.core.config import settings


def hashear_contrasena(contrasena: str) -> str:
    """Convierte una contraseña en texto plano a su hash (bcrypt)."""
    hash_bytes = bcrypt.hashpw(contrasena.encode("utf-8"), bcrypt.gensalt())
    return hash_bytes.decode("utf-8")


def verificar_contrasena(contrasena: str, contrasena_hash: str) -> bool:
    """Compara una contraseña en texto plano contra un hash guardado."""
    return bcrypt.checkpw(contrasena.encode("utf-8"), contrasena_hash.encode("utf-8"))


def crear_token(datos: dict) -> str:
    """Genera un JWT firmado, válido por ACCESS_TOKEN_EXPIRE_MINUTES."""
    a_codificar = datos.copy()
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    a_codificar.update({"exp": expira})
    return jwt.encode(a_codificar, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decodificar_token(token: str) -> dict | None:
    """Valida la firma y vigencia de un token. Devuelve None si no es válido."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
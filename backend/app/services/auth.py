from app.db.database import obtener_sesion
from app.models.usuario import Usuario
from app.core.security import verificar_contrasena
from app.exceptions.exceptions import CredencialesInvalidas


def autenticar(usuario: str, contrasena: str) -> Usuario:
    """Verifica usuario/contraseña. Lanza CredencialesInvalidas si no coinciden."""
    sesion = obtener_sesion()
    try:
        encontrado = sesion.query(Usuario).filter_by(usuario=usuario).first()
        if not encontrado or not verificar_contrasena(contrasena, encontrado.contrasena_hash):
            raise CredencialesInvalidas("Usuario o contraseña incorrectos")
        return encontrado
    finally:
        sesion.close()
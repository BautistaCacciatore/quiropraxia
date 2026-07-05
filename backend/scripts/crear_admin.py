"""
Crea el usuario administrador, o resetea su contraseña si ya existe.
Es el ÚNICO lugar del sistema donde se puede definir una contraseña
(no hay endpoint HTTP para esto, a propósito).

Requiere que la tabla 'usuarios' ya exista (correr antes la migración
de Alembic correspondiente).

Uso (desde la carpeta backend/):
    python -m scripts.crear_admin
"""

import getpass
from app.db.database import obtener_sesion
from app.models.usuario import Usuario
from app.core.security import hashear_contrasena

usuario = input("Nombre de usuario: ").strip()
contrasena = getpass.getpass("Contraseña: ")
confirmacion = getpass.getpass("Confirmar contraseña: ")

if not usuario or not contrasena:
    print("El usuario y la contraseña no pueden estar vacíos.")
    raise SystemExit(1)

if contrasena != confirmacion:
    print("Las contraseñas no coinciden.")
    raise SystemExit(1)

sesion = obtener_sesion()
try:
    existente = sesion.query(Usuario).filter_by(usuario=usuario).first()
    if existente:
        existente.contrasena_hash = hashear_contrasena(contrasena)
        print(f"Contraseña actualizada para el usuario '{usuario}'.")
    else:
        nuevo = Usuario(usuario=usuario, contrasena_hash=hashear_contrasena(contrasena))
        sesion.add(nuevo)
        print(f"Usuario '{usuario}' creado correctamente.")
    sesion.commit()
finally:
    sesion.close()
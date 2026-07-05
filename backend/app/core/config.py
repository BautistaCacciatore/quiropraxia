"""
Configuración centralizada del proyecto.

Todo lo que dependa de variables de entorno (contraseñas, URLs, etc.)
se lee acá, en un solo lugar, para no tener os.getenv() repartido
por todo el código.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Estas son las mismas variables que usa docker-compose.yml para crear
    # la base de datos. Al leer las mismas variables de un único .env,
    # evitamos tener la contraseña duplicada en dos archivos distintos.
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "quiro_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "quiro_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")

    # Si se define DATABASE_URL directamente en el .env, tiene prioridad
    # (útil el día de mañana para conectarse a un servidor de producción
    # con una URL distinta). Si no, se arma automáticamente con los datos
    # de arriba. Si no hay .env en absoluto, cae a SQLite local para poder
    # probar sin tener Postgres instalado.
    DATABASE_URL: str = os.getenv("DATABASE_URL") or (
        f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
        if os.getenv("POSTGRES_PASSWORD")
        else "sqlite:///quiro_local.db"
    )

    # Mostrar (o no) las consultas SQL en consola. Útil para debuggear.
    SQL_ECHO: bool = os.getenv("SQL_ECHO", "false").lower() == "true"

    # --- Autenticación (JWT) ---
    # SECRET_KEY firma los tokens: si alguien la conoce, puede fabricar
    # tokens válidos sin contraseña. Debe ser larga, aleatoria, y estar
    # SOLO en el .env real (nunca en el .env.example ni en el repo).
    SECRET_KEY: str = os.getenv("SECRET_KEY", "clave-de-desarrollo-cambiar-en-produccion")
    ALGORITHM: str = "HS256"
    # Cuánto dura la sesión antes de tener que loguearse de nuevo.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))  # 8 horas

    # --- Almacenamiento de archivos (radiografías, etc.) ---
    # Carpeta donde se guardan los archivos subidos. Relativa a donde se
    # corre uvicorn (backend/). El día de mañana que esto migre a la nube,
    # este valor deja de usarse acá y pasa a vivir dentro de
    # app/services/almacenamiento.py — nada más del código cambia.
    UPLOADS_DIR: str = os.getenv("UPLOADS_DIR", "uploads")
    # Tipos de archivo permitidos y tamaño máximo (en bytes) por archivo.
    TIPOS_ARCHIVO_PERMITIDOS: tuple = ("application/pdf", "image/jpeg", "image/png")
    TAMANO_MAXIMO_ARCHIVO: int = 15 * 1024 * 1024  # 15 MB


settings = Settings()
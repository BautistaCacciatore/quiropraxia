"""
Este archivo conecta Alembic con nuestro proyecto: le dice de dónde sacar
la URL de conexión (de app/core/config.py) y qué modelos existen
(de app/models/models.py), para poder comparar "cómo está la base" vs
"cómo dicen los modelos que debería estar" y generar el cambio necesario.

No hace falta tocar este archivo en el uso normal del día a día.
"""

import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Permite importar el paquete "app" aunque este script viva en migrations/
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.db.database import Base
from app.models import paciente, usuario, radiografia  # noqa: F401  (importan los modelos para registrarlos en Base.metadata)  # noqa: F401  (importa los modelos para registrarlos en Base.metadata)

# Objeto de configuración de Alembic (lee alembic.ini)
config = context.config

# Sobreescribe la URL del .ini con la que arma nuestro config.py del proyecto
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata de nuestros modelos: acá es donde Alembic "ve" qué tablas y
# columnas deberían existir según el código.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Genera el SQL de la migración sin conectarse a una base real."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Aplica la migración conectándose de verdad a la base de datos."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

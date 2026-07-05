"""
Conexión a la base de datos.

Acá vive el 'engine' (la conexión real a Postgres/SQLite), la fábrica
de sesiones, y la clase Base de la que van a heredar todos los modelos.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=settings.SQL_ECHO)

SessionLocal = sessionmaker(bind=engine)

# Todos los modelos (Paciente, y a futuro Historial, etc.) heredan de esta Base.
Base = declarative_base()


def crear_tablas():
    """Crea todas las tablas registradas si todavía no existen. No borra nada."""
    Base.metadata.create_all(engine)


def obtener_sesion():
    """Devuelve una nueva sesión para hacer operaciones contra la base."""
    return SessionLocal()


from datetime import date
from sqlalchemy import Column, Integer, String, Date, Text, DateTime, func

from app.db.database import Base

class Usuario(Base):
    """
    Tabla de login. No hay endpoint de registro: el único registro
    (o los que hagan falta) se crean por consola con scripts/crear_admin.py.
    """
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario = Column(String(50), unique=True, nullable=False, index=True)
    contrasena_hash = Column(String(255), nullable=False)

    def __repr__(self):
        return f"<Usuario {self.usuario}>"
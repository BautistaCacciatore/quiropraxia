"""
Modelo de datos de una radiografía. Un paciente puede tener varias.

El archivo real (PDF o imagen) NO se guarda en esta tabla: se guarda
en disco (ver app/services/almacenamiento.py) y acá solo se referencia
mediante ruta_archivo.
"""

from datetime import datetime, date as date_type
from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Radiografia(Base):
    __tablename__ = "radiografias"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)

    titulo = Column(String(150), nullable=False)
    fecha = Column(Date, nullable=False)
    descripcion = Column(Text, nullable=True)

    # Datos del archivo físico. ruta_archivo es lo que devuelve
    # app/services/almacenamiento.py al guardarlo — un identificador
    # opaco, no necesariamente un path real de disco.
    nombre_archivo = Column(String(255), nullable=False)  # nombre original, para mostrar
    ruta_archivo = Column(String(500), nullable=False)
    tipo_archivo = Column(String(100), nullable=False)  # mime type: application/pdf, image/jpeg, etc.

    fecha_creacion = Column(DateTime, server_default=func.now())

    paciente = relationship("Paciente", back_populates="radiografias")

    def __repr__(self):
        return f"<Radiografia {self.titulo} - paciente {self.paciente_id}>"
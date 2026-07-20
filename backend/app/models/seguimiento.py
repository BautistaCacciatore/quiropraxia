from sqlalchemy import Column, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Seguimiento(Base):
    __tablename__ = "seguimientos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, unique=True, index=True)

    filas = Column(JSON, nullable=False)

    paciente = relationship("Paciente", backref="seguimiento")

    def __repr__(self):
        return f"<Seguimiento paciente {self.paciente_id}>"

"""
Modelo de datos del paciente.
"""

from datetime import date
from sqlalchemy import Column, Integer, String, Date, Text, DateTime, JSON, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Paciente(Base):
    __tablename__ = "pacientes"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, autoincrement=True)
    dni = Column(String(15), unique=True, nullable=False, index=True)

    # --- Datos personales ---
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    telefono = Column(String(30), nullable=True)
    ocupacion = Column(String(150), nullable=True)

    # --- Datos de contexto ---
    recomendado = Column(String(150), nullable=True)
    actividad_fisica = Column(String(200), nullable=True)
    comentario = Column(Text, nullable=True)

    # --- Historia clínica ---
    # Todos en Text (sin límite práctico de longitud): son campos de
    # texto libre, se completan con tanto detalle como haga falta.
    razon_consulta = Column(Text, nullable=True)
    historia_clinica_familiar = Column(Text, nullable=True)
    historia_clinica_pasada = Column(Text, nullable=True)
    antecedentes_previos = Column(Text, nullable=True)
    estudios_previos = Column(Text, nullable=True)
    medicamentos = Column(Text, nullable=True)
    otros_datos = Column(Text, nullable=True)

    # --- Test de lateralidad de MMII y de inclinación lateral (examen físico) ---
    leg_check = Column(Text, nullable=True)
    nervoscope = Column(Text, nullable=True)
    visualizacion_frente = Column(Text, nullable=True)
    visualizacion_perfil = Column(Text, nullable=True)
    palpacion_estatica = Column(Text, nullable=True)
    palpacion_dinamica = Column(Text, nullable=True)
    # radiografia ya NO es un campo de texto acá: ahora es su propia
    # tabla (Radiografia), porque un paciente puede tener varias, y cada
    # una tiene un archivo real (PDF o imagen) adjunto.
    # Guarda el dibujo final (imagen base + marcas del médico) como PNG
    # codificado en base64. Es una sola imagen combinada frente+espalda.
    diagrama_corporal = Column(Text, nullable=True)

    # Examen de hemisfericidad (21 pruebas, ver app/services/hemisfericidad.py).
    # Se guarda como JSON: {"tono_muscular_disminuido": "derecha", ...}
    hemisfericidad_examen = Column(JSON, nullable=True)
    # Resultado calculado del examen. Se guarda explícitamente cuando el
    # médico toca "Calcular" en el frontend. Si es null, se calcula al
    # vuelo desde hemisfericidad_examen.
    hemisfericidad_resultado_guardado = Column(JSON, nullable=True)

    # --- Metadata automática ---
    fecha_registro = Column(DateTime, server_default=func.now())

    # Un paciente puede tener muchas radiografías. cascade="all, delete-orphan"
    # significa: si se borra el paciente, se borran sus radiografías con él
    # (los registros en la base; el borrado del archivo físico lo maneja
    # el service de radiografías, no esta relación).
    radiografias = relationship("Radiografia", back_populates="paciente", cascade="all, delete-orphan")

    @property
    def edad(self) -> int:
        hoy = date.today()
        años = hoy.year - self.fecha_nacimiento.year
        if (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day):
            años -= 1
        return años

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombre} {self.apellido}"

    def __repr__(self):
        return f"<Paciente {self.dni} - {self.nombre_completo}>"
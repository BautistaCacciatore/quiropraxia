"""
Crea un paciente de prueba en Supabase y mide cuánto ocupa en la BD.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.database import SessionLocal, engine, Base
from app.models.paciente import Paciente
from app.models.seguimiento import Seguimiento
from app.models.radiografia import Radiografia
from app.core.config import settings
from datetime import date
from sqlalchemy import text
import base64
import random

Base.metadata.create_all(engine)

def generar_diagrama_simulado(kb_size=100):
    """Genera un string base64 del tamaño aproximado indicado en KB.
    Usa datos aleatorios para simular un PNG real (incompresible)."""
    target_bytes = kb_size * 1024
    raw_size = int(target_bytes * 3 / 4)
    dummy_data = bytes(random.randint(0, 255) for _ in range(raw_size))
    return base64.b64encode(dummy_data).decode("ascii")

def medir_tabla():
    """Mide el tamaño real de las tablas en PostgreSQL."""
    with SessionLocal() as session:
        try:
            sql = text("""
                SELECT
                    relname as tabla,
                    pg_total_relation_size(relid) as bytes_totales,
                    pg_relation_size(relid) as bytes_datos,
                    pg_total_relation_size(relid) - pg_relation_size(relid) as bytes_indices
                FROM pg_catalog.pg_statio_user_tables
                WHERE schemaname = 'public'
                ORDER BY relname
            """)
            result = session.execute(sql).fetchall()
            for row in result:
                print(f"  {row.tabla:25s}  {row.bytes_totales:>10} B  ({row.bytes_totales/1024:.1f} KB)")
            return result
        except Exception as e:
            print(f"  (no se pudo medir: {e})")
            return None

print(f"Conectado a: {settings.DATABASE_URL[:50]}...\n")

NUM_PACIENTES = 50

print("=== Tamaño actual de tablas ===")
antes = medir_tabla()

print(f"\n=== Insertando {NUM_PACIENTES} pacientes con diagrama ~100 KB ===")
with SessionLocal() as session:
    for i in range(NUM_PACIENTES):
        diagrama = generar_diagrama_simulado(100)
        paciente = Paciente(
            dni=f"999999{i:02d}",
            nombre="Paciente",
            apellido=f"Prueba_{i:02d}",
            fecha_nacimiento=date(1990, 1, 1),
            telefono="1555555555",
            ocupacion="Ingeniero",
            recomendado="Dr. Test",
            actividad_fisica="Sedentario",
            comentario="Paciente de prueba para medir tamaño en BD" * 2,
            razon_consulta="Dolor lumbar crónico",
            historia_clinica_familiar="Madre: hipertensión. Padre: diabetes tipo 2.",
            historia_clinica_pasada="Appendicectomía en 2010. No alergias conocidas.",
            antecedentes_previos="Accidente automovilístico en 2015, latigazo cervical.",
            estudios_previos="RMN lumbar (2023): protrusión discal L4-L5.",
            medicamentos="Ibuprofeno 600 mg c/8h PRN.",
            otros_datos="Trabaja 8h sentado frente a computadora.",
            leg_check="Pierna izquierda más corta 5mm",
            nervoscope="C1: 15, C2: 12, C3: 10",
            visualizacion_frente="Hombro izquierdo elevado",
            visualizacion_perfil="Cifosis dorsal aumentada",
            palpacion_estatica="Tensión en trapecios bilateral",
            palpacion_dinamica="Dolor a la palpación en L4-L5",
            diagrama_corporal=diagrama,
            hemisfericidad_examen={"tono_muscular_disminuido": "derecha", "reflejo_patelar": "izquierda"},
            hemisfericidad_resultado_guardado={"hemisferio_dominante": "izquierdo", "puntaje": 0.75},
        )
        session.add(paciente)
    session.commit()
    print(f"  Insertados {NUM_PACIENTES} pacientes.")

print("\n=== Tamaño después de insertar ===")
despues = medir_tabla()

# Calcular delta
if antes and despues:
    for a, d in zip(antes, despues):
        delta = d.bytes_totales - a.bytes_totales
        if delta != 0:
            print(f"  >> {d.tabla} creció {delta/1024:.1f} KB ({delta/NUM_PACIENTES:.0f} B por paciente)")

print(f"\n=== Limpiando {NUM_PACIENTES} pacientes de prueba ===")
with SessionLocal() as session:
    borrados = session.query(Paciente).filter(Paciente.dni.like("999999%")).delete()
    session.commit()
    print(f"  Eliminados {borrados} pacientes.")

print("\n=== Tamaño final (post-limpieza) ===")
medir_tabla()

print("\nTerminado.")

print("\n=== Tamaño final (post-limpieza) ===")
medir_tabla()

print("\nTerminado.")

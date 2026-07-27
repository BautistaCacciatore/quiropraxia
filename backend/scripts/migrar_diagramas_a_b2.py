"""
One-time script: migra diagramas corporales existentes (base64 en DB) a B2.

Correr con (desde backend/):
    python -m scripts.migrar_diagramas_a_b2
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import base64

from app.db.database import obtener_sesion
from app.models.paciente import Paciente
from app.models.radiografia import Radiografia  # noqa: needed so Paciente.radiografias relationship resolves
from app.services import almacenamiento


def migrar():
    sesion = obtener_sesion()
    try:
        pacientes = sesion.query(Paciente).filter(
            Paciente.diagrama_corporal.isnot(None),
            Paciente.diagrama_corporal != "",
            Paciente.diagrama_corporal_ruta.is_(None),
        ).all()

        if not pacientes:
            print("No hay pacientes con diagrama_corporal para migrar.")
            return

        for p in pacientes:
            print(f"Migrando diagrama de {p.nombre} {p.apellido} (DNI {p.dni})...")
            try:
                diagrama = p.diagrama_corporal
                if "," in diagrama:
                    _, base64_data = diagrama.split(",", 1)
                else:
                    base64_data = diagrama
                contenido = base64.b64decode(base64_data)
                ruta = almacenamiento.guardar_bytes(contenido, "image/png", subcarpeta="diagramas")
                p.diagrama_corporal_ruta = ruta
                p.diagrama_corporal = None
                print(f"  -> Subido a B2: {ruta}")
            except Exception as e:
                print(f"  -> ERROR: {e}")

        sesion.commit()
        print(f"Migración completada: {len(pacientes)} paciente(s) procesado(s).")
    finally:
        sesion.close()


if __name__ == "__main__":
    migrar()

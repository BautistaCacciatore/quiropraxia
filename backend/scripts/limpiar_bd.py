"""Limpia todos los datos de pacientes, radiografías y seguimientos."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.database import SessionLocal
from sqlalchemy import text

with SessionLocal() as session:
    session.execute(text("DELETE FROM radiografias"))
    session.execute(text("DELETE FROM seguimientos"))
    session.execute(text("DELETE FROM pacientes"))
    session.commit()
    print("Base de datos limpiada: pacientes, radiografías y seguimientos eliminados.")

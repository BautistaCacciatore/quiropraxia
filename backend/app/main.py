"""
Punto de entrada de la API.

Se corre con (desde la carpeta backend/):
    uvicorn app.main:app --reload

Documentación interactiva disponible en:
    http://127.0.0.1:8000/docs
"""

import os

import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import paciente, auth, radiografias

app = FastAPI(
    title="Quiropraxia API",
    description="API para la gestión de pacientes del estudio.",
    version="0.1.0",
)

# Sin esto, el navegador bloquea los pedidos que el frontend (corriendo
# en localhost:5173) le hace a esta API (corriendo en localhost:8000),
# porque son "orígenes" distintos. Acá se lista explícitamente qué
# orígenes están permitidos a llamarla.
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allow_origins = [o.strip() for o in origins_str.split(",") if o.strip()]
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    allow_origins.append(frontend_url)

# Regex para permitir cualquier deployment de Vercel (previene errores
# cuando Vercel asigna URLs con hashes como quiropraxia-1jpvtzh24-bachi7.vercel.app)
origin_regex = re.compile(r"^https://.*\.vercel\.app$")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(paciente.router)
app.include_router(radiografias.router_paciente)
app.include_router(radiografias.router_radiografia)


@app.get("/")
def estado():
    """Endpoint simple para confirmar que la API está corriendo."""
    return {"status": "ok", "servicio": "Quiropraxia API"}
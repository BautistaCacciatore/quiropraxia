FROM python:3.11-slim

WORKDIR /app

# Railway usa como contexto la raíz del proyecto (donde está railway.json),
# no la carpeta backend/. Por eso las rutas arrancan con "backend/".
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

# Railway asigna el puerto automáticamente en $PORT (8080 en nuestro caso).
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

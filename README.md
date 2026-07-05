# Quiropraxia - Sistema de gestión de pacientes

## Estructura del proyecto

```
quiropraxia/
├── docker-compose.yml     # levanta PostgreSQL en un contenedor
├── .env                    # credenciales (NO se sube al repo)
├── .env.example              # plantilla del anterior
├── .gitignore
└── backend/
    ├── app/                  # código de la aplicación
    ├── migrations/            # historial de cambios de la base (Alembic)
    ├── scripts/                # scripts sueltos (ej: cargar datos de prueba)
    ├── alembic.ini
    └── requirements.txt
```

## Puesta en marcha

### 1. Instalar Docker Desktop
Si no lo tenés: https://www.docker.com/products/docker-desktop/

### 2. Configurar las variables de entorno

En la raíz del proyecto:
```bash
cp .env.example .env
```
Editar `.env` y poner una contraseña.

### 3. Levantar la base de datos

```bash
docker compose up -d
```

Verificar que esté corriendo:
```bash
docker compose ps
```

### 4. Instalar dependencias de Python

```bash
cd backend
pip install -r requirements.txt
```

### 5. Crear las tablas (usando Alembic)

```bash
alembic upgrade head
```

Esto aplica todas las migraciones existentes y deja la base con la
estructura que definen los modelos actuales.

## Flujo de trabajo día a día

### Cuando cambiás un modelo (agregás un campo, una tabla nueva, etc.)

```bash
cd backend
alembic revision --autogenerate -m "descripción corta del cambio"
```

Esto genera un archivo nuevo en `migrations/versions/` con el cambio
detectado. **Revisalo antes de aplicarlo** (Alembic detecta la mayoría
de los cambios, pero no todos perfectamente — por ejemplo, renombrar una
columna a veces lo interpreta como "borrar una y crear otra").

Después, aplicás el cambio a tu base:
```bash
alembic upgrade head
```

### Comandos útiles

| Comando | Qué hace |
|---|---|
| `docker compose up -d` | Levanta la base de datos en segundo plano |
| `docker compose down` | Apaga el contenedor (los datos NO se pierden) |
| `docker compose down -v` | Apaga el contenedor Y borra los datos (¡cuidado!) |
| `alembic upgrade head` | Aplica todas las migraciones pendientes |
| `alembic revision --autogenerate -m "mensaje"` | Genera una migración nueva a partir de los cambios en los modelos |
| `alembic downgrade -1` | Deshace la última migración aplicada |
| `alembic history` | Ver el historial de migraciones |

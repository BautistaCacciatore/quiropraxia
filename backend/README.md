# Backend - Sistema de Quiropraxia

## Estructura del proyecto

```
backend/
├── app/
│   ├── core/           # configuración (variables de entorno, settings)
│   │   └── config.py
│   ├── db/              # conexión a la base de datos
│   │   └── database.py
│   ├── models/           # modelos ORM = tablas reales en la base
│   │   └── models.py
│   ├── schemas/           # validación de datos de entrada/salida (Pydantic)
│   │   └── paciente.py
│   ├── exceptions/         # errores propios del proyecto
│   │   └── exceptions.py
│   ├── services/            # lógica y operaciones (CRUD)
│   │   └── crud.py
│   └── routes/               # (a futuro) endpoints de una API
├── migrations/                # historial de cambios de la base (Alembic)
│   └── versions/
├── alembic.ini
└── requirements.txt
```

El `.env` vive en la **raíz del proyecto** (no acá en `backend/`), porque
lo comparten Docker y Python. Ver el README de la raíz para el setup completo.

## ¿Por qué esta separación?

- **`models/`** = el "qué es" un dato (la tabla en la base).
- **`schemas/`** = la "forma válida" que deben tener los datos que entran o
  salen (ej: el DNI no puede estar vacío). Se valida ANTES de tocar la base.
- **`services/`** = las operaciones reales (crear, buscar, actualizar, borrar).
- **`exceptions/`** = errores propios del negocio, separados de errores
  genéricos de Python, para poder manejarlos de forma específica.
- **`routes/`** = vacía por ahora. Cuando definamos si va a haber una API
  (por ejemplo con FastAPI), los endpoints van acá.
- **`migrations/`** = cada cambio a la estructura de la base (agregar una
  tabla, una columna, etc.) queda registrado acá como un archivo versionado.
  Lo maneja Alembic — ver el README de la raíz para los comandos.

## Instalación

Ver el `README.md` de la raíz del proyecto para el setup completo
(Docker + variables de entorno + Alembic). Una vez que la base de datos
esté levantada y las tablas creadas:

```bash
pip install -r requirements.txt
```

## Cómo usar el CRUD en código propio

```python
from datetime import date
from app.schemas.paciente import PacienteCreate, PacienteUpdate
from app.services.crud import crear_paciente, obtener_paciente_por_dni, actualizar_paciente

# Crear
datos = PacienteCreate(
    dni="30111222",
    nombre="Juan",
    apellido="Pérez",
    fecha_nacimiento=date(1990, 5, 20),
)
paciente = crear_paciente(datos)

# Buscar
paciente = obtener_paciente_por_dni("30111222")
print(paciente.edad)  # se calcula solo

# Actualizar (solo lo que se pasa, el resto queda igual)
actualizar_paciente("30111222", PacienteUpdate(telefono="1155667788"))
```

## Próximos pasos sugeridos

- Modelo de "Historial médico" (consultas por fecha, ligadas al paciente)
- Definir si `routes/` va a ser una API con FastAPI
- Autenticación básica (usuario/contraseña), ya que son datos sensibles de salud

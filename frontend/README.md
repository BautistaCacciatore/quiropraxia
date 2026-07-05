# Frontend - Quiropraxia

React + Vite + React Router.

## Instalación

```bash
cd frontend
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

## Importante: CORS en el backend

Para que este frontend pueda llamar a la API, el backend (FastAPI) tiene
que permitir pedidos desde `http://localhost:5173`. Si todavía no lo
configuraste, avisame y te paso el cambio en `backend/app/main.py`
(es agregar `CORSMiddleware`, dos líneas).

## Variables de entorno

El `.env` es único para todo el proyecto y vive en la **raíz** (no acá en
`frontend/`). `vite.config.js` está configurado (`envDir`) para leerlo
de ahí. Ya incluye `VITE_API_URL`, apuntando a `http://127.0.0.1:8000`
(donde corre el backend con `uvicorn app.main:app --reload`). Si tu
backend corre en otro puerto, actualizá esa variable en el `.env` de la raíz.

## Estructura

```
src/
├── main.jsx           # punto de entrada
├── App.jsx             # navegación y rutas
├── api/                  # llamadas HTTP al backend
├── components/             # piezas de UI reutilizables
├── pages/                    # pantallas completas
├── hooks/                       # lógica de estado reutilizable
└── styles/                         # CSS
```
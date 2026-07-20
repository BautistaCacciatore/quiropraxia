const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = `Error ${response.status}`;
    try {
      const data = await response.json();
      mensaje = data.detail || mensaje;
    } catch {
      // el cuerpo no era JSON, se deja el mensaje genérico
    }
    throw new Error(mensaje);
  }
  return response.json();
}

export async function obtenerPruebas() {
  const res = await fetch(`${API_URL}/hemisfericidad/pruebas`, {
    credentials: "include",
  });
  return manejarRespuesta(res);
}

export async function calcularResultado(respuestas) {
  const res = await fetch(`${API_URL}/hemisfericidad/calcular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(respuestas || {}),
  });
  return manejarRespuesta(res);
}
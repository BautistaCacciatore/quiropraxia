/**
 * Único archivo del frontend que sabe que existe un backend HTTP.
 * Si el día de mañana cambia una URL o un endpoint, se toca acá.
 */

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
  if (response.status === 204) return null;
  return response.json();
}

export async function obtenerPaciente(dni) {
  const res = await fetch(`${API_URL}/pacientes/${dni}`, {
    credentials: "include",
  });
  return manejarRespuesta(res);
}

export async function listarPacientes(ordenPor = "apellido") {
  const res = await fetch(`${API_URL}/pacientes?orden_por=${ordenPor}`, {
    credentials: "include",
  });
  return manejarRespuesta(res);
}

export async function buscarPacientes(texto) {
  const res = await fetch(`${API_URL}/pacientes/buscar?q=${encodeURIComponent(texto)}`, {
    credentials: "include",
  });
  return manejarRespuesta(res);
}

export async function crearPaciente(datos) {
  const res = await fetch(`${API_URL}/pacientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res);
}

export async function actualizarPaciente(dni, datos) {
  const res = await fetch(`${API_URL}/pacientes/${dni}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res);
}

export async function eliminarPaciente(dni) {
  const res = await fetch(`${API_URL}/pacientes/${dni}`, {
    method: "DELETE",
    credentials: "include",
  });
  return manejarRespuesta(res);
}
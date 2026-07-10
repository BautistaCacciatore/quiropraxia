import { getAPIUrl, getAuthHeaders, manejarRespuesta } from "./http";

const API_URL = getAPIUrl();

export async function obtenerPaciente(dni) {
  const res = await fetch(`${API_URL}/pacientes/${dni}`, {
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

export async function listarPacientes(ordenPor = "apellido") {
  const res = await fetch(`${API_URL}/pacientes?orden_por=${ordenPor}`, {
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

export async function buscarPacientes(texto) {
  const res = await fetch(`${API_URL}/pacientes/buscar?q=${encodeURIComponent(texto)}`, {
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

export async function crearPaciente(datos) {
  const res = await fetch(`${API_URL}/pacientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res);
}

export async function actualizarPaciente(dni, datos) {
  const res = await fetch(`${API_URL}/pacientes/${dni}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res);
}

export async function eliminarPaciente(dni) {
  const res = await fetch(`${API_URL}/pacientes/${dni}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

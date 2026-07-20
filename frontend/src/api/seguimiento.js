import { getAPIUrl, getAuthHeaders, manejarRespuesta } from "./http";

const API_URL = getAPIUrl();

export async function obtenerSeguimiento(dni) {
  const res = await fetch(`${API_URL}/pacientes/${dni}/seguimiento`, {
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

export async function guardarSeguimiento(dni, filas) {
  const res = await fetch(`${API_URL}/pacientes/${dni}/seguimiento`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ filas }),
  });
  return manejarRespuesta(res);
}

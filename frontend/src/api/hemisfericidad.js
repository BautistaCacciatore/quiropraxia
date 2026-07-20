import { getAPIUrl, getAuthHeaders, manejarRespuesta } from "./http";

const API_URL = getAPIUrl();

export async function obtenerPruebas() {
  const res = await fetch(`${API_URL}/hemisfericidad/pruebas`, {
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

export async function calcularResultado(respuestas) {
  const res = await fetch(`${API_URL}/hemisfericidad/calcular`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(respuestas || {}),
  });
  return manejarRespuesta(res);
}
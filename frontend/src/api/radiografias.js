import { getAPIUrl, getAuthHeaders, manejarRespuesta } from "./http";

const API_URL = getAPIUrl();

export async function listarRadiografias(dni) {
  const res = await fetch(`${API_URL}/pacientes/${dni}/radiografias`, {
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

export async function subirRadiografia(dni, { titulo, fecha, descripcion, archivo }) {
  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("fecha", fecha);
  if (descripcion) formData.append("descripcion", descripcion);
  formData.append("archivo", archivo);

  const res = await fetch(`${API_URL}/pacientes/${dni}/radiografias`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return manejarRespuesta(res);
}

export async function eliminarRadiografia(id) {
  const res = await fetch(`${API_URL}/radiografias/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

export function urlArchivo(id, { descargar = false } = {}) {
  const base = `${API_URL}/radiografias/${id}/archivo`;
  return descargar ? `${base}?descargar=true` : base;
}

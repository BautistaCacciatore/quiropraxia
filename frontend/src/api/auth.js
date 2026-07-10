import { getAPIUrl, getAuthHeaders, manejarRespuesta } from "./http";

const API_URL = getAPIUrl();

export async function login(usuario, contrasena) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, contrasena }),
  });
  const data = await manejarRespuesta(res);
  localStorage.setItem("access_token", data.access_token);
  return data;
}

export async function logout() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
  });
  localStorage.removeItem("access_token");
  return manejarRespuesta(res);
}

export async function obtenerSesion() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { ...getAuthHeaders() },
  });
  return manejarRespuesta(res);
}

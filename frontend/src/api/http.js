const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function getAPIUrl() {
  return API_URL;
}

export function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = `Error ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") {
        mensaje = data.detail;
      } else if (Array.isArray(data.detail)) {
        mensaje = data.detail.map((e) => e.msg).join("; ");
      }
    } catch {
      // el cuerpo no era JSON, se deja el mensaje genérico
    }
    throw new Error(mensaje);
  }
  if (response.status === 204) return null;
  return response.json();
}

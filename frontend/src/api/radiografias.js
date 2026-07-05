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

export async function listarRadiografias(dni) {
  const res = await fetch(`${API_URL}/pacientes/${dni}/radiografias`, {
    credentials: "include",
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
    credentials: "include",
    // OJO: no seteamos "Content-Type" a mano. El navegador arma el
    // header correcto (multipart/form-data con el "boundary") solo
    // cuando el body es un FormData.
    body: formData,
  });
  return manejarRespuesta(res);
}

export async function eliminarRadiografia(id) {
  const res = await fetch(`${API_URL}/radiografias/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return manejarRespuesta(res);
}

export function urlArchivo(id) {
  return `${API_URL}/radiografias/${id}/archivo`;
}
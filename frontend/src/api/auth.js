const API_URL = import.meta.env.VITE_API_URL;

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

export async function login(usuario, contrasena) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // credentials: "include" es lo que hace que el navegador acepte y
    // guarde la cookie httpOnly que devuelve el backend.
    credentials: "include",
    body: JSON.stringify({ usuario, contrasena }),
  });
  return manejarRespuesta(res);
}

export async function logout() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return manejarRespuesta(res);
}

export async function obtenerSesion() {
  // Se llama al cargar la app: si la cookie sigue siendo válida, esto
  // devuelve el usuario sin necesidad de loguearse de nuevo.
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  });
  return manejarRespuesta(res);
}
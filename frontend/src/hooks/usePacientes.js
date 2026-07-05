import { useState, useEffect, useCallback } from "react";
import * as api from "../api/pacientes";

/**
 * Centraliza el estado (datos, carga, error) y las operaciones sobre
 * pacientes, para que las páginas/componentes no tengan que repetir
 * esta lógica cada vez.
 */
export function usePacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarTodos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await api.listarPacientes();
      setPacientes(datos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodos();
  }, [cargarTodos]);

  const buscar = useCallback(
    async (texto) => {
      if (!texto.trim()) {
        cargarTodos();
        return;
      }
      setCargando(true);
      setError(null);
      try {
        const datos = await api.buscarPacientes(texto);
        setPacientes(datos);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    },
    [cargarTodos]
  );

  const crear = useCallback(async (datos) => {
    const nuevo = await api.crearPaciente(datos);
    setPacientes((prev) => [...prev, nuevo].sort((a, b) => a.apellido.localeCompare(b.apellido)));
    return nuevo;
  }, []);

  const actualizar = useCallback(async (dni, datos) => {
    const actualizado = await api.actualizarPaciente(dni, datos);
    setPacientes((prev) => prev.map((p) => (p.dni === dni ? actualizado : p)));
    return actualizado;
  }, []);

  const eliminar = useCallback(async (dni) => {
    await api.eliminarPaciente(dni);
    setPacientes((prev) => prev.filter((p) => p.dni !== dni));
  }, []);

  return { pacientes, cargando, error, cargarTodos, buscar, crear, actualizar, eliminar };
}

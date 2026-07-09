import { useState, useEffect } from "react";
import { listarRadiografias, subirRadiografia, eliminarRadiografia, urlArchivo } from "../api/radiografias";
import RadiografiaVisor from "./RadiografiaVisor";
import "../styles/RadiografiasPaciente.css";

const FORM_INICIAL = { titulo: "", fecha: "", descripcion: "" };

export default function RadiografiasPaciente({ dni }) {
  const [radiografias, setRadiografias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [archivo, setArchivo] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [radiografiaSeleccionada, setRadiografiaSeleccionada] = useState(null);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dni]);

  // Genera (y libera) una URL de vista previa cuando el archivo elegido
  // es una imagen. Para PDF no hay preview visual, solo el ícono.
  useEffect(() => {
    if (!archivo || !archivo.type.startsWith("image/")) {
      setPrevisualizacion(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setPrevisualizacion(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarRadiografias(dni);
      setRadiografias(datos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function manejarSeleccionArchivo(e) {
    setArchivo(e.target.files[0] || null);
  }

  function quitarArchivo() {
    setArchivo(null);
    document.getElementById("input-archivo-radiografia").value = "";
  }

  function formatearTamano(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function manejarSubida(e) {
    e.preventDefault();
    if (!archivo) {
      setError("Seleccioná un archivo (PDF, JPG o PNG).");
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      await subirRadiografia(dni, { ...form, archivo });
      setForm(FORM_INICIAL);
      quitarArchivo();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  async function manejarEliminar(id) {
    if (!window.confirm("¿Eliminar esta radiografía? No se puede deshacer.")) return;
    try {
      await eliminarRadiografia(id);
      setRadiografias((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  function formatearFecha(fechaIso) {
    // fechaIso viene como "YYYY-MM-DD"; se le agrega hora para que
    // el navegador no le reste un día por husos horarios.
    return new Date(`${fechaIso}T00:00:00`).toLocaleDateString("es-AR");
  }

  return (
    <div className="radiografias-paciente">
      <form className="formulario-radiografia" onSubmit={manejarSubida}>
        <div className="grilla-campos">
          <label>
            Título
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              required
            />
          </label>

          <label>
            Fecha
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))}
              required
            />
          </label>
        </div>

        <label className="campo-ancho">
          Descripción
          <textarea
            rows="2"
            value={form.descripcion}
            onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
          />
        </label>

        <div className="campo-ancho">
          <span className="etiqueta-diagrama">Archivo (PDF, JPG o PNG — máximo 15 MB)</span>

          <div className="selector-archivo">
            <input
              id="input-archivo-radiografia"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={manejarSeleccionArchivo}
              className="input-archivo-oculto"
              required
            />
            <label htmlFor="input-archivo-radiografia" className="boton-elegir-archivo">
              Elegir archivo
            </label>

            {archivo ? (
              <div className="previsualizacion-archivo">
                {previsualizacion ? (
                  <img src={previsualizacion} alt="Vista previa" />
                ) : (
                  <div className="icono-archivo-generico">PDF</div>
                )}
                <div className="datos-archivo-seleccionado">
                  <span className="nombre-archivo-seleccionado">{archivo.name}</span>
                  <span className="tamano-archivo-seleccionado">{formatearTamano(archivo.size)}</span>
                </div>
                <button
                  type="button"
                  className="btn-quitar-archivo"
                  onClick={quitarArchivo}
                  aria-label="Quitar archivo seleccionado"
                >
                  ✕
                </button>
              </div>
            ) : (
              <span className="texto-sin-archivo">Ningún archivo seleccionado</span>
            )}
          </div>
        </div>

        {error && <p className="mensaje-error">{error}</p>}

        <div className="acciones-formulario">
          <button type="submit" className="btn-primario" disabled={subiendo}>
            {subiendo ? "Subiendo..." : "Subir radiografía"}
          </button>
        </div>
      </form>

      <div className="lista-radiografias">
        {cargando ? (
          <p className="estado-cargando">Cargando radiografías...</p>
        ) : radiografias.length === 0 ? (
          <div className="estado-vacio">
            <p>Todavía no hay radiografías cargadas.</p>
          </div>
        ) : (
          radiografias.map((r) => (
            <div key={r.id} className="tarjeta-radiografia">
              <div className="vista-previa-radiografia">
                {r.tipo_archivo.startsWith("image/") ? (
                  <img src={urlArchivo(r.id)} alt={r.titulo} />
                ) : (
                  <div className="icono-pdf">PDF</div>
                )}
              </div>

              <div className="info-radiografia">
                <p className="fecha-radiografia">{formatearFecha(r.fecha)}</p>
                <h4>{r.titulo}</h4>
                {r.descripcion && <p className="descripcion-radiografia">{r.descripcion}</p>}

                <div className="acciones-radiografia">
                  <button type="button" className="btn-texto" onClick={() => setRadiografiaSeleccionada(r)}>
                    Ver
                  </button>
                  <a href={urlArchivo(r.id, { descargar: true })} className="btn-texto">
                    Descargar
                  </a>
                  <button type="button" className="btn-texto btn-texto-peligro" onClick={() => manejarEliminar(r.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <RadiografiaVisor radiografia={radiografiaSeleccionada} onCerrar={() => setRadiografiaSeleccionada(null)} />
    </div>
  );
}
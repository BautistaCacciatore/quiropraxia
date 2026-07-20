import { useState, useEffect, useRef } from "react";
import DiagramaCorporal from "./DiagramaCorporal";
import RadiografiasPaciente from "./RadiografiasPaciente";
import HemisfericidadExamen from "./HemisfericidadExamen";
import "../styles/PacienteForm.css";

const CAMPOS_INICIALES = {
  dni: "",
  nombre: "",
  apellido: "",
  fecha_nacimiento: "",
  telefono: "",
  ocupacion: "",
  recomendado: "",
  actividad_fisica: "",
  comentario: "",
  razon_consulta: "",
  historia_clinica_familiar: "",
  historia_clinica_pasada: "",
  antecedentes_previos: "",
  estudios_previos: "",
  medicamentos: "",
  otros_datos: "",
  leg_check: "",
  nervoscope: "",
  visualizacion_frente: "",
  visualizacion_perfil: "",
  palpacion_estatica: "",
  palpacion_dinamica: "",
  diagrama_corporal: "",
  hemisfericidad_examen: {},
};

const TOTAL_PASOS_CREACION = 3;

export default function PacienteForm({ pacienteInicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState(CAMPOS_INICIALES);
  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const esEdicion = Boolean(pacienteInicial);

  // En edición hay 4 secciones navegables libremente (pestañas). En
  // creación, "Radiografías" no existe todavía: el paciente recién se
  // crea al guardar, y las radiografías necesitan un DNI ya guardado.
  const pestañas = esEdicion
    ? [
        { id: 1, etiqueta: "Información personal" },
        { id: 2, etiqueta: "Test de lateralidad" },
        { id: 3, etiqueta: "Hemisfericidad" },
        { id: 4, etiqueta: "Radiografías" },
      ]
    : [
        { id: 1, etiqueta: "Información personal" },
        { id: 2, etiqueta: "Test de lateralidad" },
        { id: 3, etiqueta: "Hemisfericidad" },
      ];

  useEffect(() => {
    setPaso(1);
    if (pacienteInicial) {
      // hemisfericidad_examen es un objeto, no texto: se trata aparte
      // para no convertirlo en "" junto con el resto de los campos.
      const { hemisfericidad_examen, ...resto } = pacienteInicial;
      const entradasTexto = Object.fromEntries(
        Object.entries(resto).map(([clave, valor]) => [clave, valor ?? ""])
      );
      setForm({
        ...CAMPOS_INICIALES,
        ...entradasTexto,
        hemisfericidad_examen: hemisfericidad_examen || {},
      });
    } else {
      setForm(CAMPOS_INICIALES);
    }
  }, [pacienteInicial]);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function actualizarHemisfericidad(clave, valor) {
    setForm((prev) => ({
      ...prev,
      hemisfericidad_examen: { ...prev.hemisfericidad_examen, [clave]: valor },
    }));
  }

  function irASiguiente() {
    // reportValidity() solo revisa los campos que están montados en el
    // DOM en este momento (los del paso actual). Los pasos 2 y 3 no
    // tienen campos obligatorios, así que esto no bloquea nada ahí.
    if (formRef.current.reportValidity()) {
      setPaso((p) => Math.min(p + 1, TOTAL_PASOS_CREACION));
    }
  }

  function irAAnterior() {
    setPaso((p) => Math.max(p - 1, 1));
  }

  async function manejarEnvio(e) {
    e.preventDefault();

    if (esEdicion) {
      // En edición se puede navegar libremente entre pestañas, así que
      // los campos obligatorios (Información personal) podrían no estar
      // visibles cuando se aprieta Guardar. Se valida a mano en vez de
      // depender de reportValidity(), que solo mira el DOM actual.
      if (!form.nombre || !form.apellido || !form.fecha_nacimiento) {
        setPaso(1);
        setError("Completá nombre, apellido y fecha de nacimiento antes de guardar.");
        return;
      }
    } else if (paso !== TOTAL_PASOS_CREACION) {
      irASiguiente();
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      if (esEdicion) {
        const { dni, hemisfericidad_resultado, ...datosEditables } = form;
        await onGuardar(pacienteInicial.dni, datosEditables);
      } else {
        await onGuardar(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tarjeta-formulario">
      {esEdicion ? (
        <div className="pestañas-formulario">
          {pestañas.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pestaña-boton ${paso === p.id ? "activa" : ""}`}
              onClick={() => setPaso(p.id)}
            >
              {p.etiqueta}
            </button>
          ))}
        </div>
      ) : (
        <p className="indicador-paso">
          Paso {paso} de {TOTAL_PASOS_CREACION}
        </p>
      )}

      {error && <p className="mensaje-error">{error}</p>}

      {paso === 4 && esEdicion ? (
        // Ojo: esto NO va dentro de un <form>. RadiografiasPaciente tiene
        // su propio <form> para subir archivos, y un <form> anidado dentro
        // de otro rompe el submit.
        <>
          <section className="seccion-formulario">
            <h3>Radiografías</h3>
            <RadiografiasPaciente dni={pacienteInicial.dni} />
          </section>

          <div className="acciones-formulario">
            <button type="button" className="btn-secundario" onClick={onCancelar}>
              Volver
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={manejarEnvio} ref={formRef}>
          {paso === 1 && (
            <>
              <section className="seccion-formulario">
                <h3>Datos personales</h3>
                <div className="grilla-campos">
                  <label>
                    DNI
                    <input
                      type="text"
                      value={form.dni}
                      onChange={(e) => actualizarCampo("dni", e.target.value)}
                      required
                      disabled={esEdicion}
                    />
                  </label>

                  <label>
                    Nombre
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => actualizarCampo("nombre", e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Apellido
                    <input
                      type="text"
                      value={form.apellido}
                      onChange={(e) => actualizarCampo("apellido", e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Fecha de nacimiento
                    <input
                      type="date"
                      value={form.fecha_nacimiento}
                      onChange={(e) => actualizarCampo("fecha_nacimiento", e.target.value)}
                      required
                    />
                  </label>
                </div>
              </section>

              <section className="seccion-formulario">
                <h3>Contacto y contexto</h3>
                <div className="grilla-campos">
                  <label>
                    Teléfono
                    <input type="text" value={form.telefono} onChange={(e) => actualizarCampo("telefono", e.target.value)} />
                  </label>

                  <label>
                    Ocupación
                    <input type="text" value={form.ocupacion} onChange={(e) => actualizarCampo("ocupacion", e.target.value)} />
                  </label>

                  <label>
                    Recomendado por
                    <input
                      type="text"
                      value={form.recomendado}
                      onChange={(e) => actualizarCampo("recomendado", e.target.value)}
                    />
                  </label>

                  <label>
                    Actividad física
                    <input
                      type="text"
                      value={form.actividad_fisica}
                      onChange={(e) => actualizarCampo("actividad_fisica", e.target.value)}
                    />
                  </label>
                </div>

                <label className="campo-ancho">
                  Algo para comentar
                  <textarea rows="3" value={form.comentario} onChange={(e) => actualizarCampo("comentario", e.target.value)} />
                </label>
              </section>

              <section className="seccion-formulario">
                <h3>Historia clínica</h3>

                <label className="campo-ancho">
                  Historia clínica familiar
                  <textarea
                    rows="4"
                    value={form.historia_clinica_familiar}
                    onChange={(e) => actualizarCampo("historia_clinica_familiar", e.target.value)}
                  />
                </label>

                <label className="campo-ancho">
                  Historia clínica pasada
                  <textarea
                    rows="4"
                    value={form.historia_clinica_pasada}
                    onChange={(e) => actualizarCampo("historia_clinica_pasada", e.target.value)}
                  />
                </label>

                <label className="campo-ancho">
                  Razón de la consulta
                  <textarea
                    rows="3"
                    value={form.razon_consulta}
                    onChange={(e) => actualizarCampo("razon_consulta", e.target.value)}
                  />
                </label>

                <label className="campo-ancho">
                  Antecedentes previos
                  <textarea
                    rows="4"
                    value={form.antecedentes_previos}
                    onChange={(e) => actualizarCampo("antecedentes_previos", e.target.value)}
                  />
                </label>

                <label className="campo-ancho">
                  Estudios previos
                  <textarea
                    rows="4"
                    value={form.estudios_previos}
                    onChange={(e) => actualizarCampo("estudios_previos", e.target.value)}
                  />
                </label>

                <label className="campo-ancho">
                  Medicamentos (razón)
                  <textarea rows="3" value={form.medicamentos} onChange={(e) => actualizarCampo("medicamentos", e.target.value)} />
                </label>

                <label className="campo-ancho">
                  Algo más para agregar
                  <textarea rows="3" value={form.otros_datos} onChange={(e) => actualizarCampo("otros_datos", e.target.value)} />
                </label>
              </section>
            </>
          )}

          {paso === 2 && (
            <section className="seccion-formulario">
              <h3>Examen físico — Test de lateralidad de MMII e inclinación lateral</h3>

              <div className="grilla-campos">
                <label>
                  Leg Check
                  <input type="text" value={form.leg_check} onChange={(e) => actualizarCampo("leg_check", e.target.value)} />
                </label>

                <label>
                  Nervoscope
                  <input type="text" value={form.nervoscope} onChange={(e) => actualizarCampo("nervoscope", e.target.value)} />
                </label>

                <label>
                  Visualización: Frente
                  <input
                    type="text"
                    value={form.visualizacion_frente}
                    onChange={(e) => actualizarCampo("visualizacion_frente", e.target.value)}
                  />
                </label>

                <label>
                  Visualización: Perfil
                  <input
                    type="text"
                    value={form.visualizacion_perfil}
                    onChange={(e) => actualizarCampo("visualizacion_perfil", e.target.value)}
                  />
                </label>

                <label>
                  Palpación estática
                  <input
                    type="text"
                    value={form.palpacion_estatica}
                    onChange={(e) => actualizarCampo("palpacion_estatica", e.target.value)}
                  />
                </label>

                <label>
                  Palpación dinámica
                  <input
                    type="text"
                    value={form.palpacion_dinamica}
                    onChange={(e) => actualizarCampo("palpacion_dinamica", e.target.value)}
                  />
                </label>
              </div>

              <div className="campo-ancho">
                <span className="etiqueta-diagrama">Diagrama corporal — marcar zonas afectadas</span>
                <DiagramaCorporal
                  valorInicial={form.diagrama_corporal}
                  onCambiar={(dataUrl) => actualizarCampo("diagrama_corporal", dataUrl)}
                />
              </div>
            </section>
          )}

          {paso === 3 && (
            <section className="seccion-formulario">
              <h3>Hemisfericidad</h3>
              <HemisfericidadExamen valores={form.hemisfericidad_examen} onCambiar={actualizarHemisfericidad} />
            </section>
          )}

          <div className="acciones-formulario">
            {esEdicion ? (
              <>
                <button type="button" className="btn-secundario" onClick={onCancelar} disabled={enviando}>
                  Volver
                </button>
                <button type="submit" className="btn-primario" disabled={enviando}>
                  {enviando ? "Guardando..." : "Guardar cambios"}
                </button>
              </>
            ) : (
              <>
                {paso === 1 && (
                  <button type="button" className="btn-secundario" onClick={onCancelar} disabled={enviando}>
                    Cancelar
                  </button>
                )}
                {paso > 1 && (
                  <button type="button" className="btn-secundario" onClick={irAAnterior} disabled={enviando}>
                    Anterior
                  </button>
                )}
                {paso < TOTAL_PASOS_CREACION && (
                  <button type="button" className="btn-primario" onClick={irASiguiente}>
                    Siguiente
                  </button>
                )}
                {paso === TOTAL_PASOS_CREACION && (
                  <button type="submit" className="btn-primario" disabled={enviando}>
                    {enviando ? "Guardando..." : "Guardar"}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
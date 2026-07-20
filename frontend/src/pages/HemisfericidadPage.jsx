import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPaciente, actualizarPaciente } from "../api/pacientes";
import { calcularResultado } from "../api/hemisfericidad";
import HemisfericidadExamen from "../components/HemisfericidadExamen";

export default function HemisfericidadPage() {
  const { dni } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [valores, setValores] = useState({});
  const [resultadoGuardado, setResultadoGuardado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [resultadoActual, setResultadoActual] = useState(null);
  const [error, setError] = useState(null);
  const [exitoso, setExitoso] = useState(false);

  useEffect(() => {
    obtenerPaciente(dni)
      .then((p) => {
        setPaciente(p);
        setValores(p.hemisfericidad_examen || {});
        setResultadoGuardado(p.hemisfericidad_resultado || null);
      })
      .finally(() => setCargando(false));
  }, [dni]);

  function actualizarValor(clave, valor) {
    setValores((prev) => ({ ...prev, [clave]: valor }));
    setResultadoActual(null);
  }

  async function manejarCalcular() {
    setCalculando(true);
    setError(null);
    try {
      const res = await calcularResultado(valores);
      setResultadoActual(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setCalculando(false);
    }
  }

  async function manejarGuardar() {
    setGuardando(true);
    setError(null);
    setExitoso(false);
    try {
      const payload = { hemisfericidad_examen: valores };
      if (resultadoActual) {
        payload.hemisfericidad_resultado_guardado = resultadoActual;
      }
      const p = await actualizarPaciente(dni, payload);
      setResultadoGuardado(p.hemisfericidad_resultado);
      setResultadoActual(null);
      setExitoso(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const resultadoMostrar = resultadoActual || resultadoGuardado;

  if (cargando) {
    return <p className="estado-cargando">Cargando...</p>;
  }

  return (
    <div className="pagina-seguimiento">
      <div className="encabezado-pagina">
        <div>
          <h2>Examen de Hemisfericidad</h2>
          {paciente && (
            <p className="subtitulo">
              {paciente.apellido}, {paciente.nombre} — DNI {dni}
            </p>
          )}
        </div>
        <div className="acciones-seguimiento">
          <button type="button" className="btn-secundario" onClick={() => navigate("/pacientes")}>
            Volver
          </button>
          <button type="button" className="btn-secundario" onClick={manejarCalcular} disabled={calculando}>
            {calculando ? "Calculando..." : "Calcular"}
          </button>
          <button type="button" className="btn-primario" onClick={manejarGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar todo"}
          </button>
        </div>
      </div>

      {error && <p className="mensaje-error">{error}</p>}
      {exitoso && <p className="mensaje-exito">Resultado guardado correctamente.</p>}

      {resultadoMostrar && (
        <div className="resultado-hemisfericidad" style={{ marginBottom: "1rem" }}>
          <div className="totales-hemisfericidad">
            {[
              { label: "Corteza Derecha", valor: resultadoMostrar.corteza_derecha },
              { label: "Corteza Izquierda", valor: resultadoMostrar.corteza_izquierda },
              { label: "Cerebelo Derecho", valor: resultadoMostrar.cerebelo_derecho },
              { label: "Cerebelo Izquierdo", valor: resultadoMostrar.cerebelo_izquierdo },
              { label: "Tallo Derecho", valor: resultadoMostrar.tallo_derecho },
              { label: "Tallo Izquierdo", valor: resultadoMostrar.tallo_izquierdo },
            ].map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.valor}</strong>
              </div>
            ))}
          </div>
          <p className="lado-ajuste">
            Lado de ajuste sugerido: <strong>{resultadoMostrar.lado_ajuste}</strong>
          </p>
        </div>
      )}

      <HemisfericidadExamen valores={valores} onCambiar={actualizarValor} />
    </div>
  );
}

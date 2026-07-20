import { useState, useEffect } from "react";
import { obtenerPruebas, calcularResultado } from "../api/hemisfericidad";
import "../styles/HemisfericidadExamen.css";

const OPCIONES = [
  { valor: "derecha", etiqueta: "Derecha" },
  { valor: "izquierda", etiqueta: "Izquierda" },
  { valor: "normal", etiqueta: "Normal" },
];

/**
 * valores: { [key_de_prueba]: "derecha" | "izquierda" | "normal" }
 * onCambiar(key, valor): avisa al formulario padre que cambió una respuesta
 */
export default function HemisfericidadExamen({ valores, onCambiar }) {
  const [pruebas, setPruebas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [resultado, setResultado] = useState(null);
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    obtenerPruebas()
      .then(setPruebas)
      .finally(() => setCargando(false));
  }, []);

  async function manejarCalcular() {
    setCalculando(true);
    try {
      const datos = await calcularResultado(valores || {});
      setResultado(datos);
    } finally {
      setCalculando(false);
    }
  }

  if (cargando) {
    return <p className="estado-cargando">Cargando pruebas...</p>;
  }

  return (
    <div className="hemisfericidad-examen">
      <div className="tabla-hemisfericidad-contenedor">
        <table className="tabla-hemisfericidad">
          <thead>
            <tr>
              <th>Prueba</th>
              {OPCIONES.map((o) => (
                <th key={o.valor}>{o.etiqueta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pruebas.map((p) => (
              <tr key={p.key}>
                <td>{p.nombre}</td>
                {OPCIONES.map((o) => (
                  <td key={o.valor} className="celda-radio">
                    <input
                      type="radio"
                      name={`prueba-${p.key}`}
                      checked={(valores?.[p.key] || "") === o.valor}
                      onChange={() => onCambiar(p.key, o.valor)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="acciones-hemisfericidad">
        <button type="button" className="btn-secundario" onClick={manejarCalcular} disabled={calculando}>
          {calculando ? "Calculando..." : "Calcular resultado"}
        </button>
      </div>

      {resultado && (
        <div className="resultado-hemisfericidad">
          <div className="totales-hemisfericidad">
            <div>
              <span>Corteza Derecha</span>
              <strong>{resultado.corteza_derecha}</strong>
            </div>
            <div>
              <span>Corteza Izquierda</span>
              <strong>{resultado.corteza_izquierda}</strong>
            </div>
            <div>
              <span>Cerebelo Derecho</span>
              <strong>{resultado.cerebelo_derecho}</strong>
            </div>
            <div>
              <span>Cerebelo Izquierdo</span>
              <strong>{resultado.cerebelo_izquierdo}</strong>
            </div>
            <div>
              <span>Tallo Derecho</span>
              <strong>{resultado.tallo_derecho}</strong>
            </div>
            <div>
              <span>Tallo Izquierdo</span>
              <strong>{resultado.tallo_izquierdo}</strong>
            </div>
          </div>

          <p className="lado-ajuste">
            Lado de ajuste sugerido: <strong>{resultado.lado_ajuste}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
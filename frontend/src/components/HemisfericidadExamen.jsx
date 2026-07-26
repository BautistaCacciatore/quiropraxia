import { useState, useEffect } from "react";
import { obtenerPruebas } from "../api/hemisfericidad";
import "./HemisfericidadExamen.css";

const OPCIONES = [
  { valor: "derecha", etiqueta: "Derecha" },
  { valor: "izquierda", etiqueta: "Izquierda" },
  { valor: "normal", etiqueta: "Normal" },
];

/**
 * valores: { [key_de_prueba]: "derecha" | "izquierda" | "normal" }
 * onCambiar(key, valor): avisa al formulario padre que cambió una respuesta
 * (valor puede ser "" para "sin marcar" — se puede deseleccionar)
 */
export default function HemisfericidadExamen({ valores, onCambiar }) {
  const [pruebas, setPruebas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerPruebas()
      .then(setPruebas)
      .finally(() => setCargando(false));
  }, []);

  function manejarClickOpcion(key, valorClickeado) {
    const valorActual = valores?.[key] || "";
    onCambiar(key, valorActual === valorClickeado ? "" : valorClickeado);
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
              <th>Estructura afectada</th>
              {OPCIONES.map((o) => (
                <th key={o.valor}>{o.etiqueta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pruebas.map((p) => (
              <tr key={p.key}>
                <td>{p.nombre}</td>
                <td className="celda-estructura">{p.estructura}</td>
                {OPCIONES.map((o) => (
                  <td key={o.valor} className="celda-radio">
                    <input
                      type="radio"
                      name={`prueba-${p.key}`}
                      checked={(valores?.[p.key] || "") === o.valor}
                      onClick={() => manejarClickOpcion(p.key, o.valor)}
                      onChange={() => {}}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ayuda-deseleccionar">Tip: hacé click de nuevo sobre una opción ya marcada para dejarla sin responder.</p>
    </div>
  );
}
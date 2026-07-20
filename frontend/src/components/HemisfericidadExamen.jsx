import { useState, useEffect } from "react";
import { obtenerPruebas } from "../api/hemisfericidad";
import "../styles/HemisfericidadExamen.css";

const OPCIONES = [
  { valor: "derecha", etiqueta: "Derecha" },
  { valor: "izquierda", etiqueta: "Izquierda" },
  { valor: "normal", etiqueta: "Normal" },
];

export default function HemisfericidadExamen({ valores, onCambiar }) {
  const [pruebas, setPruebas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerPruebas()
      .then(setPruebas)
      .finally(() => setCargando(false));
  }, []);

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
    </div>
  );
}

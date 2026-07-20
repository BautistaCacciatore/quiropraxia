const COLUMNAS = [
  { key: "n", label: "N°", fija: true },
  { key: "fecha", label: "FECHA", tipo: "date" },
  { key: "c0", label: "C0" },
  { key: "c1", label: "C1" },
  { key: "c2", label: "C2" },
  { key: "c3", label: "C3" },
  { key: "c4", label: "C4" },
  { key: "c5", label: "C5" },
  { key: "c6", label: "C6" },
  { key: "d0", label: "D0" },
  { key: "d1", label: "D1" },
  { key: "d2", label: "D2" },
  { key: "d3", label: "D3" },
  { key: "d4", label: "D4" },
  { key: "d5", label: "D5" },
  { key: "d6", label: "D6" },
  { key: "d7", label: "D7" },
  { key: "d8", label: "D8" },
  { key: "d9", label: "D9" },
  { key: "d10", label: "D10" },
  { key: "d11", label: "D11" },
  { key: "d12", label: "D12" },
  { key: "l1", label: "L1" },
  { key: "l2", label: "L2" },
  { key: "l3", label: "L3" },
  { key: "l4", label: "L4" },
  { key: "l5", label: "L5" },
  { key: "li", label: "LI" },
  { key: "ld", label: "LD" },
  { key: "s", label: "S" },
  { key: "c", label: "C" },
];

const FILAS_INICIALES = Array.from({ length: 15 }, (_, i) => ({
  fecha: "",
  c0: "", c1: "", c2: "", c3: "", c4: "", c5: "", c6: "",
  d0: "", d1: "", d2: "", d3: "", d4: "", d5: "", d6: "",
  d7: "", d8: "", d9: "", d10: "", d11: "", d12: "",
  l1: "", l2: "", l3: "", l4: "", l5: "",
  li: "", ld: "",
  s: "", c: "",
}));

export { FILAS_INICIALES };

export default function SeguimientoTabla({ filas, onChange }) {
  function actualizarCelda(idx, key, valor) {
    const nuevas = filas.map((f, i) => (i === idx ? { ...f, [key]: valor } : f));
    onChange(nuevas);
  }

  return (
    <div className="tabla-seguimiento-contenedor">
      <table className="tabla-seguimiento">
        <thead>
          <tr>
            {COLUMNAS.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, idx) => (
            <tr key={idx}>
              {COLUMNAS.map((col) => {
                if (col.fija) {
                  return <td key={col.key} className="celda-fija">{idx + 1}</td>;
                }
                return (
                  <td key={col.key} className="celda-editable">
                    <input
                      type={col.tipo || "text"}
                      value={fila[col.key] ?? ""}
                      onChange={(e) => actualizarCelda(idx, col.key, e.target.value)}
                      maxLength={col.tipo === "date" ? undefined : 5}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

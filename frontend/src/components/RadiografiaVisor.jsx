import { urlArchivo } from "../api/radiografias";
import "../styles/RadiografiaVisor.css";

export default function RadiografiaVisor({ radiografia, onCerrar }) {
  if (!radiografia) return null;

  const esImagen = radiografia.tipo_archivo.startsWith("image/");
  const url = urlArchivo(radiografia.id);

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" onClick={onCerrar}>
      {/* stopPropagation: si no, cualquier click adentro del visor cierra el modal */}
      <div className="modal-caja modal-visor" onClick={(e) => e.stopPropagation()}>
        <div className="encabezado-visor">
          <h3>{radiografia.titulo}</h3>
          <button type="button" className="btn-cerrar-visor" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="contenido-visor">
          {esImagen ? (
            <img src={url} alt={radiografia.titulo} />
          ) : (
            <iframe src={url} title={radiografia.titulo} />
          )}
        </div>

        <div className="pie-visor">
          <a href={urlArchivo(radiografia.id, { descargar: true })} className="btn-texto">
            Descargar
          </a>
        </div>
      </div>
    </div>
  );
}
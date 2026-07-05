import { useRef, useEffect } from "react";
import "../styles/DiagramaCorporal.css";

const IMAGEN_BASE = "/diagrama-corporal.png";

/**
 * Canvas de dibujo libre superpuesto a la silueta del cuerpo.
 * El médico marca directo con el mouse (o el dedo, en tablet/celular)
 * las zonas afectadas. Al soltar el trazo, se guarda automáticamente
 * la imagen combinada (fondo + marcas) como PNG en base64.
 */
export default function DiagramaCorporal({ valorInicial, onCambiar }) {
  const canvasRef = useRef(null);
  const dibujando = useRef(false);

  // Carga la imagen inicial (el dibujo ya guardado, si existía, o la
  // silueta en blanco) una sola vez, al montar el componente.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = valorInicial || IMAGEN_BASE;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function obtenerCoordenadas(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // El canvas puede mostrarse más chico de lo que mide en píxeles reales
    // (ver CSS), así que hay que escalar el click/touch a la resolución real.
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    const evento = e.touches ? e.touches[0] : e;
    return {
      x: (evento.clientX - rect.left) * escalaX,
      y: (evento.clientY - rect.top) * escalaY,
    };
  }

  function empezarTrazo(e) {
    e.preventDefault();
    dibujando.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = obtenerCoordenadas(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function dibujar(e) {
    if (!dibujando.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = obtenerCoordenadas(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function terminarTrazo() {
    if (!dibujando.current) return;
    dibujando.current = false;
    guardarCambio();
  }

  function guardarCambio() {
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onCambiar(dataUrl);
  }

  function borrarTodo() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      guardarCambio();
    };
    img.src = IMAGEN_BASE;
  }

  return (
    <div className="diagrama-corporal">
      <canvas
        ref={canvasRef}
        className="lienzo-diagrama"
        onMouseDown={empezarTrazo}
        onMouseMove={dibujar}
        onMouseUp={terminarTrazo}
        onMouseLeave={terminarTrazo}
        onTouchStart={empezarTrazo}
        onTouchMove={dibujar}
        onTouchEnd={terminarTrazo}
      />
      <button type="button" className="btn-secundario btn-borrar-diagrama" onClick={borrarTodo}>
        Borrar dibujo
      </button>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFloraSantuario } from "../../api/client.js";
import { identificarFlora } from "../../lib/clasificadorFlora.js";

/**
 * Pilar 1 (ANEXO1): "Galería de flora del santuario (oyamel, pino,
 * eucalipto) con identificación por IA (usando cámara del celular)".
 */
export default function GaleriaFlora() {
  const [flora, setFlora] = useState([]);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    getFloraSantuario().then(setFlora).catch((e) => console.warn("Flora:", e));
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const activarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamaraActiva(true);
      setResultado(null);
    } catch (e) {
      alert("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
    }
  };

  const capturarYAnalizar = async () => {
    if (!videoRef.current) return;
    setAnalizando(true);
    try {
      const { coincidencia, confiable, prediccionesCrudas } = await identificarFlora(
        videoRef.current,
        flora
      );
      setResultado({ coincidencia, confiable, prediccionesCrudas });
    } catch (e) {
      console.error(e);
      setResultado({ error: "No se pudo analizar la imagen. Intenta de nuevo." });
    } finally {
      setAnalizando(false);
    }
  };

  const detenerCamara = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCamaraActiva(false);
  };

  return (
    <div className="galeria-flora">
      <h3 className="font-titulo">🌲 Galería de Flora del Santuario</h3>
      <p className="texto-secundario">
        Identifica oyamel, pino y eucalipto apuntando tu cámara. La IA corre
        directamente en tu teléfono, sin costo y sin enviar tus fotos a ningún servidor.
      </p>

      {!camaraActiva ? (
        <button className="boton-gradiente" onClick={activarCamara}>
          📷 Activar identificación por cámara
        </button>
      ) : (
        <div className="camara-contenedor">
          <video ref={videoRef} autoPlay playsInline muted className="camara-video" />
          <div className="camara-controles">
            <button className="boton-gradiente" onClick={capturarYAnalizar} disabled={analizando}>
              {analizando ? "Analizando…" : "🔍 Identificar planta"}
            </button>
            <button className="boton-secundario" onClick={detenerCamara}>Cerrar cámara</button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="tarjeta-cristal resultado-flora"
          >
            {resultado.error && <p>{resultado.error}</p>}
            {!resultado.error && resultado.confiable && (
              <>
                <strong>{resultado.coincidencia.nombre_comun}</strong>
                <em> — {resultado.coincidencia.nombre_cientifico}</em>
                <p>{resultado.coincidencia.descripcion}</p>
              </>
            )}
            {!resultado.error && !resultado.confiable && (
              <p>
                No encontramos una coincidencia clara con la flora catalogada del
                santuario. Prueba acercando más la cámara o compara visualmente
                con la galería de referencia abajo.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grilla-flora">
        {flora.map((f) => (
          <div key={f.id_flora} className="tarjeta-cristal ficha-flora">
            <strong>{f.nombre_comun}</strong>
            <em>{f.nombre_cientifico}</em>
            <p>{f.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

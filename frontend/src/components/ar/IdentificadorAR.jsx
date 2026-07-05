import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEspeciesAR, registrarHallazgoAR } from "../../api/client.js";
import { identificarFlora } from "../../lib/clasificadorFlora.js";
import { obtenerIdentificadorDispositivo } from "../../lib/identidadDispositivo.js";
import { celebrarLogro } from "../../lib/confetti.js";

/**
 * Pilar 3 (ANEXO1) — "Identificador de Especies con IA": apunta la
 * cámara a un árbol o mariposa y la app sugiere qué especie es.
 * Corre 100% en el navegador con TensorFlow.js + MobileNet (mismo
 * motor que la Galería de Flora del Pilar 1, aquí generalizado a
 * flora + fauna y conectado a la Caza del Tesoro Digital).
 */
export default function IdentificadorAR() {
  const [especies, setEspecies] = useState([]);
  const [camaraLista, setCamaraLista] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const idDispositivo = useRef(obtenerIdentificadorDispositivo());

  useEffect(() => {
    getEspeciesAR().then(setEspecies).catch((e) => console.warn("Especies AR:", e));
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const activarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamaraLista(true);
      setResultado(null);
    } catch {
      alert("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
    }
  };

  const identificar = async () => {
    if (!videoRef.current) return;
    setAnalizando(true);
    try {
      const { coincidencia, confiable, prediccionesCrudas } = await identificarFlora(videoRef.current, especies);
      setResultado({ coincidencia, confiable, prediccionesCrudas });

      if (confiable && coincidencia) {
        let coords = null;
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          coords = { latitud: pos.coords.latitude, longitud: pos.coords.longitude };
        } catch { /* geolocalización opcional para el registro de hallazgo */ }

        const { nuevo, badge_otorgado } = await registrarHallazgoAR(
          idDispositivo.current,
          coincidencia.id_flora,
          coords
        );
        if (nuevo) {
          celebrarLogro();
          if (badge_otorgado) setTimeout(() => celebrarLogro(), 400);
        }
      }
    } catch (e) {
      console.error(e);
      setResultado({ error: "No se pudo analizar la imagen. Intenta de nuevo." });
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <div className="identificador-ar">
      <h3 className="font-titulo">🔍 Identificador de Especies con IA</h3>
      <p className="texto-secundario">
        Apunta a un árbol o a una mariposa. Ej.: <em>"Oyamel (Abies religiosa) —
        Especie nativa, crucial para hibernación"</em> o <em>"Danaus plexippus —
        Mariposa Monarca, especie migratoria protegida"</em>.
      </p>

      {!camaraLista ? (
        <button className="boton-primario" onClick={activarCamara}>📷 Activar identificador</button>
      ) : (
        <div className="camara-contenedor">
          <video ref={videoRef} autoPlay playsInline muted className="camara-video" />
          <div className="camara-controles">
            <button className="boton-primario" onClick={identificar} disabled={analizando}>
              {analizando ? "Analizando…" : "🔎 Identificar especie"}
            </button>
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
                <strong>
                  {resultado.coincidencia.nombre_comun} ({resultado.coincidencia.nombre_cientifico})
                </strong>
                <p>{resultado.coincidencia.descripcion}</p>
                <span className="badge-mini">
                  {resultado.coincidencia.tipo_especie === "fauna" ? "🦋 Fauna" : "🌲 Flora"} · añadido a tu Caza del Tesoro
                </span>
              </>
            )}
            {!resultado.error && !resultado.confiable && (
              <p>No encontramos una coincidencia clara. Acércate más o mejora la iluminación e inténtalo de nuevo.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getContenidosEducativos, registrarProgresoContenido } from "../../api/client.js";
import { obtenerIdentificadorDispositivo } from "../../lib/identidadDispositivo.js";

/**
 * Pilar 1 (ANEXO1): "Videos cortos (30-60 seg) tipo 'Reels' sobre:
 * migración, hibernación, amenazas, conservación".
 * Los videos se alojan en Cloudinary (free tier) — sólo se referencia
 * la URL en `contenidos_educativos.url_multimedia`.
 */
export default function VideoReels({ onVisto }) {
  const [videos, setVideos] = useState([]);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const idDispositivo = useRef(obtenerIdentificadorDispositivo());

  useEffect(() => {
    getContenidosEducativos()
      .then((contenidos) => setVideos(contenidos.filter((c) => c.tipo === "video")))
      .catch((e) => console.warn("Videos:", e));
  }, []);

  const marcarVisto = async (idContenido) => {
    try {
      const { nuevos_badges } = await registrarProgresoContenido(idDispositivo.current, idContenido);
      if (nuevos_badges?.length) onVisto?.(nuevos_badges);
    } catch (e) {
      console.warn("No se pudo registrar progreso:", e);
    }
  };

  if (videos.length === 0) {
    return <p className="texto-secundario">Aún no hay reels publicados en esta sección.</p>;
  }

  const video = videos[indiceActivo];

  return (
    <div className="reels-contenedor">
      <h3 className="font-titulo">🎬 Reels del Santuario</h3>
      <motion.div
        key={video.id_contenido}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="reel-tarjeta tarjeta-cristal"
      >
        <video
          src={video.url_multimedia}
          controls
          className="reel-video"
          onEnded={() => marcarVisto(video.id_contenido)}
        />
        <div className="reel-info">
          <strong>{video.titulo}</strong>
          <p>{video.descripcion}</p>
        </div>
      </motion.div>

      <div className="reels-miniaturas">
        {videos.map((v, i) => (
          <button
            key={v.id_contenido}
            className={`reel-miniatura ${i === indiceActivo ? "activa" : ""}`}
            onClick={() => setIndiceActivo(i)}
          >
            {v.titulo}
          </button>
        ))}
      </div>
    </div>
  );
}

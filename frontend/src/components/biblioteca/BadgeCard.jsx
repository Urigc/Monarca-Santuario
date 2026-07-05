import React from "react";
import { motion } from "framer-motion";

/** Pilar 1: insignia digital de la Ruta de Aprendizaje Gamificada. */
export default function BadgeCard({ badge }) {
  return (
    <motion.div
      className={`tarjeta-cristal badge-card ${badge.obtenido ? "badge-obtenido" : "badge-bloqueado"}`}
      whileHover={{ scale: 1.04 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="badge-icono">{badge.obtenido ? badge.icono_emoji : "🔒"}</span>
      <strong>{badge.nombre}</strong>
      <p>{badge.descripcion}</p>
      {badge.obtenido && badge.fecha_obtencion && (
        <span className="badge-fecha">
          Obtenido: {new Date(badge.fecha_obtencion).toLocaleDateString("es-MX")}
        </span>
      )}
    </motion.div>
  );
}

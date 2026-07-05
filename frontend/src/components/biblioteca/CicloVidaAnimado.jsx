import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ETAPAS = [
  { id: "huevo", nombre: "Huevo", emoji: "🥚", color: "#FFD700",
    descripcion: "La hembra deposita el huevo en el envés de una hoja de asclepia. Eclosiona en 3-5 días." },
  { id: "oruga", nombre: "Oruga", emoji: "🐛", color: "#2D6A4F",
    descripcion: "Come asclepia sin parar durante 2 semanas, mudando de piel 5 veces." },
  { id: "crisalida", nombre: "Crisálida", emoji: "🟢", color: "#1A1A2E",
    descripcion: "Se transforma dentro de una cápsula verde jade con puntos dorados, por 8-12 días." },
  { id: "mariposa", nombre: "Mariposa", emoji: "🦋", color: "#FF6B35",
    descripcion: "Emerge, seca sus alas y en generaciones sucesivas migra hasta 4,000 km a México." },
];

/**
 * Pilar 1 (ANEXO1): "Ciclo de vida animado (huevo → oruga → crisálida →
 * mariposa) con SVGs animados y micro-interacciones".
 */
export default function CicloVidaAnimado({ onEtapaCompleta }) {
  const [etapaActiva, setEtapaActiva] = useState(0);

  const avanzar = () => {
    const siguiente = (etapaActiva + 1) % ETAPAS.length;
    setEtapaActiva(siguiente);
    if (siguiente === ETAPAS.length - 1) onEtapaCompleta?.();
  };

  const etapa = ETAPAS[etapaActiva];

  return (
    <div className="ciclo-vida">
      <h3 className="font-titulo">🔄 Ciclo de Vida de la Mariposa Monarca</h3>

      <div className="ciclo-vida-escenario tarjeta-cristal">
        <AnimatePresence mode="wait">
          <motion.div
            key={etapa.id}
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="ciclo-vida-emoji"
            style={{ color: etapa.color }}
            onClick={avanzar}
            role="button"
            tabIndex={0}
          >
            {etapa.emoji}
          </motion.div>
        </AnimatePresence>

        <h4>{etapa.nombre}</h4>
        <p>{etapa.descripcion}</p>
        <span className="ciclo-vida-tip">Toca la imagen para ver la siguiente etapa →</span>
      </div>

      <div className="ciclo-vida-progreso">
        {ETAPAS.map((e, i) => (
          <motion.span
            key={e.id}
            className="ciclo-vida-punto"
            style={{ background: i === etapaActiva ? e.color : "#ccc" }}
            animate={i === etapaActiva ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
}

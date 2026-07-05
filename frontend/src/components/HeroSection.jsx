import React from "react";
import { motion } from "framer-motion";
import HeroTitulo from "./HeroTitulo.jsx";
import SubtituloTypewriter from "./SubtituloTypewriter.jsx";
import ParticulasMariposas from "./ParticulasMariposas.jsx";
import ButtonPrimary from "./ui/ButtonPrimary.jsx";

/**
 * Hero Section (ANEXO1 Pilar 2 + Ajustes2.0).
 * Fondo con gradiente animado (o video si se sube
 * /public/videos/monarca-flight.mp4), partículas de mariposas,
 * título con stagger + shimmer, subtítulo typewriter y CTA con pulse.
 */
export default function HeroSection({ onExplorar }) {
  return (
    <div className="hero-monarca">
      <video autoPlay loop muted playsInline className="hero-video">
        <source src="/videos/monarca-flight.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay" />
      <ParticulasMariposas cantidad={16} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hero-contenido"
      >
        <motion.div
          className="hero-emoji"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          🦋
        </motion.div>

        <HeroTitulo />
        <SubtituloTypewriter texto="Únete a la revolución digital para preservar a la mariposa monarca en Piedra Herrada" />

        <div style={{ marginTop: "1.5rem" }}>
          <ButtonPrimary onClick={onExplorar} icon="🦋" pulso>
            Explorar el Bosque
          </ButtonPrimary>
        </div>
      </motion.div>
    </div>
  );
}

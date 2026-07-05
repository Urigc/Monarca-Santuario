import React from "react";
import { motion } from "framer-motion";

/**
 * Pilar 2 (ANEXO1): Hero Section de bienvenida.
 * Usa un gradiente animado como fondo por defecto (sin depender de un
 * asset de video que el usuario aún no ha subido); si existe
 * /videos/monarca-flight.mp4 en /public, se reproduce automáticamente.
 */
export default function HeroSection({ onExplorar }) {
  return (
    <div className="hero-monarca">
      <video autoPlay loop muted playsInline className="hero-video" poster="">
        <source src="/videos/monarca-flight.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
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

        <h1 className="font-titulo hero-titulo">
          Santuario Digital
          <br />
          <span className="hero-titulo-acento">Temascaltepec</span>
        </h1>

        <p className="hero-subtitulo">
          Únete a la revolución digital para preservar a la mariposa monarca
          en Piedra Herrada
        </p>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="boton-gradiente"
          onClick={onExplorar}
        >
          Explorar el Bosque 🦋
        </motion.button>
      </motion.div>
    </div>
  );
}

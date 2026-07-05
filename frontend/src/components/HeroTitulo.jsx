import React from "react";
import { motion } from "framer-motion";

/**
 * Ajustes2.0 — "Agrega animación al título principal del Hero":
 * fade in + slide up, stagger por letra (0.1s), easing bounce suave,
 * hover con escala + glow naranja, y gradient text con shimmer.
 */
const VARIANTES_CONTENEDOR = {
  oculto: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const VARIANTES_LETRA = {
  oculto: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }, // cubic-bezier bounce suave
  },
};

function TextoAnimadoPorLetra({ texto, claseSpan = "" }) {
  return (
    <motion.span
      variants={VARIANTES_CONTENEDOR}
      initial="oculto"
      animate="visible"
      style={{ display: "inline-block" }}
    >
      {texto.split("").map((letra, i) => (
        <motion.span
          key={i}
          variants={VARIANTES_LETRA}
          className={claseSpan}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {letra}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function HeroTitulo() {
  return (
    <motion.h1
      className="font-titulo hero-titulo"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <TextoAnimadoPorLetra texto="Santuario Digital" />
      <br />
      <span className="hero-titulo-shimmer">
        <TextoAnimadoPorLetra texto="Temascaltepec" />
      </span>
    </motion.h1>
  );
}

import React from "react";
import { motion } from "framer-motion";

/**
 * Ajustes2.0 — "Componentes Reutilizables: Botón Primario (CTA)".
 * Variante `pulso` agrega la animación infinita pedida para el CTA
 * del Hero ("Botón CTA con pulse animation infinita").
 */
export default function ButtonPrimary({ children, onClick, icon, pulso = false, type = "button" }) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 107, 53, 0.6)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`boton-primario font-subtitulo ${pulso ? "animate-pulso" : ""}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
}

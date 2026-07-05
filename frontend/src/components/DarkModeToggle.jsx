import React from "react";
import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { useDarkMode } from "../hooks/useDarkMode.js";

export default function DarkModeToggle() {
  const { modoOscuro, alternar } = useDarkMode();

  return (
    <motion.button
      onClick={alternar}
      whileTap={{ scale: 0.85, rotate: 180 }}
      whileHover={{ scale: 1.1 }}
      aria-label="Cambiar tema claro/oscuro"
      style={{
        background: "rgba(255,255,255,0.15)",
        border: "none",
        borderRadius: "999px",
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "white",
      }}
    >
      {modoOscuro ? <FiSun size={18} /> : <FiMoon size={18} />}
    </motion.button>
  );
}

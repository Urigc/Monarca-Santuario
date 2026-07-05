import React from "react";

/** Ajustes2.0 — "Componentes Reutilizables: Tarjeta con Glassmorphism". */
export default function GlassCard({ children, className = "" }) {
  return <div className={`tarjeta-cristal ${className}`}>{children}</div>;
}

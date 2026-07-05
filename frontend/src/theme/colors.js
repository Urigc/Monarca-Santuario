/**
 * Paleta "Diseño que Emociona" (ANEXO1, Pilar 2), espejo del
 * tailwind.config.js pero disponible como JS puro para: colores de
 * capas deck.gl (arrays RGB), gradientes SVG y variables CSS runtime.
 */
export const PALETA_MONARCA = {
  naranja: "#FF6B35",
  negro: "#1A1A2E",
  verde: "#2D6A4F",
  dorado: "#FFD700",
};

export const PALETA_MONARCA_RGB = {
  naranja: [255, 107, 53],
  negro: [26, 26, 46],
  verde: [45, 106, 79],
  dorado: [255, 215, 0],
};

export function hexARgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

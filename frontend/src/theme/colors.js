/**
 * Paleta oficial "Diseño que Emociona" (ANEXO1 Pilar 2 + Ajustes2.0).
 * Espejo en JS puro de las variables CSS de :root, disponible para
 * capas deck.gl (arrays RGB), gradientes SVG y canvas de partículas.
 */
export const PALETA_MONARCA = {
  naranja: "#FF6B35",
  negro: "#1A1A2E",
  verde: "#2D6A4F",
  dorado: "#FFD700",
  cielo: "#4ECDC4",
  tierra: "#8B4513",
};

export const PALETA_MONARCA_RGB = {
  naranja: [255, 107, 53],
  negro: [26, 26, 46],
  verde: [45, 106, 79],
  dorado: [255, 215, 0],
  cielo: [78, 205, 196],
  tierra: [139, 69, 19],
};

export const GRADIENTES = {
  hero: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
  bosque: "linear-gradient(180deg, #2D6A4F 0%, #1B4332 100%)",
  oro: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
};

export const SOMBRAS = {
  suave: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  dramatica: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
  glow: "0 0 20px rgba(255, 107, 53, 0.5)",
};

export function hexARgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

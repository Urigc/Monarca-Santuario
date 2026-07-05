import confetti from "canvas-confetti";
import { PALETA_MONARCA } from "../theme/colors.js";

/**
 * Pilar 2 (ANEXO1): "Al completar una misión: Confetti animation".
 * Se dispara al desbloquear un badge en la Ruta de Aprendizaje.
 */
export function celebrarLogro() {
  const colores = [PALETA_MONARCA.naranja, PALETA_MONARCA.dorado, PALETA_MONARCA.verde];

  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });

  // Segunda ráfaga lateral para un efecto más festivo
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors });
  }, 200);
}

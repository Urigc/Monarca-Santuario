/** Sistema de diseño "Diseño que Emociona" (Pilar 2, ANEXO1 + Ajustes2.0). */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        monarca: {
          naranja: "#FF6B35",
          negro: "#1A1A2E",
          verde: "#2D6A4F",
          dorado: "#FFD700",
          cielo: "#4ECDC4",
          tierra: "#8B4513",
        },
      },
      fontFamily: {
        // Ajustes2.0: Montserrat para títulos (mayor impacto que Poppins solo)
        titulo: ["Montserrat", "sans-serif"],
        subtitulo: ["Poppins", "sans-serif"],
        cuerpo: ["Inter", "sans-serif"],
      },
      backdropBlur: { glass: "16px" },
      keyframes: {
        aleteo: {
          "0%, 100%": { transform: "rotate(0deg) scale(1)" },
          "25%": { transform: "rotate(-12deg) scale(1.05)" },
          "75%": { transform: "rotate(12deg) scale(1.05)" },
        },
        brilloGradiente: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        pulso: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,107,53,0.55)" },
          "50%": { boxShadow: "0 0 0 14px rgba(255,107,53,0)" },
        },
      },
      animation: {
        aleteo: "aleteo 0.6s ease-in-out infinite",
        "brillo-gradiente": "brilloGradiente 3s ease infinite",
        pulso: "pulso 2s ease infinite",
      },
      backgroundSize: { "gradiente-200": "200% 200%" },
      transitionTimingFunction: {
        "bounce-suave": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

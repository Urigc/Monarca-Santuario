/** Sistema de diseño "Diseño que Emociona" (Pilar 2, ANEXO1). */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        monarca: {
          naranja: "#FF6B35",   // Acción, energía
          negro: "#1A1A2E",     // Elegancia, seriedad
          verde: "#2D6A4F",     // Naturaleza, preservación
          dorado: "#FFD700",    // Recompensas, logros
        },
      },
      fontFamily: {
        titulo: ["Poppins", "sans-serif"],
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
      },
      animation: {
        aleteo: "aleteo 0.6s ease-in-out infinite",
        "brillo-gradiente": "brilloGradiente 3s ease infinite",
      },
      backgroundSize: { "gradiente-200": "200% 200%" },
    },
  },
  plugins: [],
};

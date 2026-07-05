import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Configuración PWA (Sección 8: Canalización PWA) — permite instalar el
// mapa como app nativa y cachear los últimos datos para zonas de
// Piedra Herrada sin señal celular.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "Santuario Digital Temascaltepec",
        short_name: "SantuarioDigital",
        description: "Plataforma de Inteligencia Territorial Comunitaria — Piedra Herrada",
        theme_color: "#2f5233",
        background_color: "#f4f1e8",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      injectManifest: {
        // Se generan/precachean automáticamente los assets de build
        globPatterns: ["**/*.{js,css,html,png,svg}"]
      }
    })
  ],
  server: { port: 5173 }
});

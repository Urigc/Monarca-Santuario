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
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/v2\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "santuario-api-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 12 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/\{s\}\.tile\.openstreetmap\.org\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles-cache",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  server: { port: 5173 }
});

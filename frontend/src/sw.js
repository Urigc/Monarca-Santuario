import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// Inyectado automáticamente por vite-plugin-pwa (estrategia injectManifest)
precacheAndRoute(self.__WB_MANIFEST);

// Sección 8 (V2.0): API con NetworkFirst para que datos frescos ganen
// cuando hay señal, pero sigan disponibles offline en Piedra Herrada.
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/v2/") || url.pathname.startsWith("/api/v3/"),
  new NetworkFirst({
    cacheName: "santuario-api-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 12 })],
  })
);

registerRoute(
  ({ url }) => url.hostname.endsWith("tile.openstreetmap.org"),
  new CacheFirst({
    cacheName: "osm-tiles-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

/**
 * Pilar 4 (ANEXO1) — "Guardian Push": recibe la notificación enviada
 * por el backend (pywebpush + VAPID) y la muestra aunque la PWA esté
 * cerrada. Este es el evento estándar de la Push API del navegador.
 */
self.addEventListener("push", (event) => {
  let datos = { title: "🚨 Alerta del Santuario", body: "Tienes una nueva notificación." };
  try {
    if (event.data) datos = event.data.json();
  } catch {
    if (event.data) datos.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(datos.title, {
      body: datos.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: datos.data || {},
      vibrate: [200, 100, 200],
    })
  );
});

/** Al tocar la notificación, enfoca o abre la app (Pilar 4). */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});

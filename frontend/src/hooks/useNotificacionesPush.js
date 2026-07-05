import { useState, useCallback } from "react";
import { API_BASE_URL } from "../api/client.js";
import { obtenerIdentificadorDispositivo } from "../lib/identidadDispositivo.js";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Pilar 4 (ANEXO1) — "Notificaciones Push PWA". Suscribe al usuario
 * usando la Push API estándar del navegador (no requiere Firebase);
 * el backend usa VAPID + pywebpush para enviar (web_push_client.py).
 */
export function useNotificacionesPush() {
  const [estado, setEstado] = useState("inactivo"); // inactivo | suscribiendo | activo | error | no-soportado
  const [error, setError] = useState(null);

  const suscribir = useCallback(async (idSector) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setEstado("no-soportado");
      return;
    }
    setEstado("suscribiendo");
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado("error");
        setError("Permiso de notificaciones denegado.");
        return;
      }

      const registro = await navigator.serviceWorker.ready;
      const { vapid_public_key } = await fetch(`${API_BASE_URL}/api/v3/push/vapid-public-key`).then((r) =>
        r.json()
      );
      if (!vapid_public_key) {
        setEstado("error");
        setError("El servidor aún no tiene configurada una clave VAPID.");
        return;
      }

      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid_public_key),
      });

      const payload = suscripcion.toJSON();
      await fetch(`${API_BASE_URL}/api/v3/push/suscribir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_identificador: obtenerIdentificadorDispositivo(),
          id_sector: idSector ?? null,
          endpoint: payload.endpoint,
          keys: payload.keys,
        }),
      });

      setEstado("activo");
    } catch (e) {
      console.error(e);
      setEstado("error");
      setError(e.message);
    }
  }, []);

  return { estado, error, suscribir };
}

import React from "react";
import { useNotificacionesPush } from "../hooks/useNotificacionesPush.js";

/** Pilar 4 (ANEXO1): invitación a activar "Guardian Push" en el header. */
export default function GuardianPushBanner() {
  const { estado, error, suscribir } = useNotificacionesPush();

  if (estado === "activo") {
    return <span className="guardian-push-estado activo">🔔 Guardian Push activo</span>;
  }
  if (estado === "no-soportado") return null;

  return (
    <button
      className="guardian-push-boton"
      onClick={() => suscribir()}
      disabled={estado === "suscribiendo"}
      title={error || "Recibe alertas críticas aunque no tengas la app abierta"}
    >
      {estado === "suscribiendo" ? "Activando…" : "🔔 Activar alertas"}
    </button>
  );
}

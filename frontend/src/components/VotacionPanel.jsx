import React, { useEffect, useState } from "react";
import { votarReporte } from "../api/client.js";

/**
 * Sistema de Votación Cruzada Ejidal (Sección 6 y endpoint 3.3).
 * Los miembros del comité usan una credencial simple para marcar un
 * reporte ciudadano como Verificado o Falso, mitigando el vandalismo
 * de datos descrito en la Sección 3.
 */
export default function VotacionPanel({ reportesPendientes = [], onVotoRegistrado }) {
  const [credencial, setCredencial] = useState("");
  const [enviandoId, setEnviandoId] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const emitirVoto = async (idReporte, voto_positivo) => {
    if (!credencial.trim()) {
      setMensaje("Ingresa tu credencial de asamblea (ej. CE-TEMAS-2026-X9).");
      return;
    }
    setEnviandoId(idReporte);
    try {
      const resultado = await votarReporte(idReporte, {
        validador_credencial: credencial,
        voto_positivo,
      });
      setMensaje(`Voto registrado. Estado actual del reporte: ${resultado.estado_actual_reporte}.`);
      onVotoRegistrado?.(idReporte, resultado);
    } catch (e) {
      setMensaje("No se pudo registrar el voto (¿ya votaste este reporte?).");
    } finally {
      setEnviandoId(null);
    }
  };

  return (
    <section>
      <h3>🗳️ Validación Cruzada Ejidal</h3>
      <input
        placeholder="Tu credencial de asamblea"
        value={credencial}
        onChange={(e) => setCredencial(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
      />

      {reportesPendientes.length === 0 && (
        <p style={{ fontSize: "0.85rem", color: "#666" }}>No hay reportes pendientes de revisión.</p>
      )}

      {reportesPendientes.map((r) => (
        <div key={r.id_reporte} className="insight-card">
          <strong>{r.tipo_suceso}</strong>
          <p style={{ margin: "0.3rem 0" }}>{r.descripcion}</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              disabled={enviandoId === r.id_reporte}
              onClick={() => emitirVoto(r.id_reporte, true)}
            >
              ✅ Verídico
            </button>
            <button
              disabled={enviandoId === r.id_reporte}
              onClick={() => emitirVoto(r.id_reporte, false)}
            >
              ❌ Desmentido
            </button>
          </div>
        </div>
      ))}

      {mensaje && <p style={{ fontSize: "0.8rem" }}>{mensaje}</p>}
    </section>
  );
}

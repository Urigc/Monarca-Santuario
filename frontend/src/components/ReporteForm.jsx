import React, { useState } from "react";
import { registrarReporteComunitario } from "../api/client.js";

const TIPOS_SUCESO = [
  "Avistamiento tala",
  "Plaga descortezador",
  "Incendio",
  "Basura",
];

/**
 * Módulo de Interacción Directa: "Gobernanza de la Voz del Santuario"
 * (Sección 6). Offline-First: usa GPS nativo, guarda en IndexedDB si
 * no hay señal y sincroniza automáticamente al reconectar.
 */
export default function ReporteForm() {
  const [form, setForm] = useState({
    usuario_rol: "Poblador Anónimo",
    tipo_suceso: TIPOS_SUCESO[0],
    descripcion: "",
  });
  const [coords, setCoords] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const capturarUbicacion = () => {
    if (!navigator.geolocation) {
      setMensaje("Este dispositivo no soporta GPS nativo.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }),
      () => setMensaje("No se pudo obtener tu ubicación. Actívala e inténtalo de nuevo."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords) {
      setMensaje("Primero captura tu ubicación GPS.");
      return;
    }
    if (!form.descripcion.trim()) {
      setMensaje("Describe brevemente el incidente.");
      return;
    }

    setEnviando(true);
    const reporte = { ...form, ...coords };
    const resultado = await registrarReporteComunitario(reporte);
    setEnviando(false);

    setMensaje(
      resultado.almacenadoLocalmente
        ? "📴 Sin señal: reporte guardado en tu teléfono. Se enviará automáticamente al recuperar conexión."
        : "✅ Reporte enviado al comité ejidal para su revisión."
    );
    setForm({ usuario_rol: "Poblador Anónimo", tipo_suceso: TIPOS_SUCESO[0], descripcion: "" });
    setCoords(null);
  };

  return (
    <section>
      <h3>📢 Reportar Incidente</h3>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <select
          value={form.tipo_suceso}
          onChange={(e) => setForm({ ...form, tipo_suceso: e.target.value })}
        >
          {TIPOS_SUCESO.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          placeholder="Tu rol (ej. Guía Comunitario)"
          value={form.usuario_rol}
          onChange={(e) => setForm({ ...form, usuario_rol: e.target.value })}
        />

        <textarea
          placeholder="Describe lo que observaste…"
          rows={3}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <button type="button" onClick={capturarUbicacion}>
          {coords ? `📍 Ubicación capturada (${coords.latitud.toFixed(4)}, ${coords.longitud.toFixed(4)})` : "📍 Capturar mi ubicación GPS"}
        </button>

        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar reporte"}
        </button>
      </form>
      {mensaje && <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{mensaje}</p>}
    </section>
  );
}

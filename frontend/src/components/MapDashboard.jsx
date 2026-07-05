import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import ZonificacionLayer from "./layers/ZonificacionLayer.jsx";
import AvistamientosHeatLayer from "./layers/AvistamientosHeatLayer.jsx";
import SemaforoMicroclimaLayer from "./layers/SemaforoMicroclimaLayer.jsx";
import NDVILayer from "./layers/NDVILayer.jsx";
import InfraestructuraLayer from "./layers/InfraestructuraLayer.jsx";
import AuditoriaLayer from "./layers/AuditoriaLayer.jsx";
import SiniestrosLayer from "./layers/SiniestrosLayer.jsx";
import { useAleteoController } from "./MonarcaAleteo.jsx";
import {
  getSectores, getAvistamientos, getMicroclimaActual,
  getNdviActual, getInfraestructura, getAlertas,
} from "../api/client.js";

// Coordenadas del santuario Piedra Herrada, Temascaltepec, Edo. Méx.
const CENTRO_SANTUARIO = [19.1186, -100.0411];

export default function MapDashboard({ capasActivas }) {
  const [datos, setDatos] = useState({
    sectores: [], avistamientos: [], microclima: [],
    ndvi: [], infraestructura: [], alertas: [],
  });
  const [cargando, setCargando] = useState(true);
  const contenedorRef = useRef(null);
  const { disparar, overlay } = useAleteoController();

  /** Pilar 2 (ANEXO1): dispara la animación de aleteo en el punto de clic. */
  const onMarcaClic = (e) => {
    const original = e.originalEvent;
    const rect = contenedorRef.current?.getBoundingClientRect();
    if (!original || !rect) return;
    disparar(original.clientX - rect.left, original.clientY - rect.top);
  };

  useEffect(() => {
    async function cargarTodo() {
      try {
        const [sectores, avistamientos, microclima, ndvi, infraestructura, alertas] =
          await Promise.all([
            getSectores(), getAvistamientos(), getMicroclimaActual(),
            getNdviActual(), getInfraestructura(), getAlertas(),
          ]);
        setDatos({ sectores, avistamientos, microclima, ndvi, infraestructura, alertas });
      } catch (e) {
        console.warn("No se pudo contactar al backend (¿está corriendo en :8000?):", e);
      } finally {
        setCargando(false);
      }
    }
    cargarTodo();
  }, []);

  return (
    <div ref={contenedorRef} style={{ position: "relative", height: "100%", width: "100%" }}>
    <MapContainer
      center={CENTRO_SANTUARIO}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      preferCanvas
    >
      {/* OpenStreetMap: cartografía base gratuita, optimizada para PWA (Sección 5 y 8) */}
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {capasActivas.zonificacion && <ZonificacionLayer sectores={datos.sectores} onMarcaClic={onMarcaClic} />}
      {capasActivas.avistamientos && <AvistamientosHeatLayer avistamientos={datos.avistamientos} />}
      {capasActivas.microclima && (
        <SemaforoMicroclimaLayer microclima={datos.microclima} sectores={datos.sectores} onMarcaClic={onMarcaClic} />
      )}
      {capasActivas.ndvi && <NDVILayer ndvi={datos.ndvi} sectores={datos.sectores} />}
      {capasActivas.infraestructura && <InfraestructuraLayer nodos={datos.infraestructura} onMarcaClic={onMarcaClic} />}
      {capasActivas.auditoria && <AuditoriaLayer onMarcaClic={onMarcaClic} />}
      {capasActivas.siniestros && <SiniestrosLayer />}

      {cargando && (
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 1000,
          background: "white", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: "0.8rem",
        }}>
          Cargando datos territoriales…
        </div>
      )}
    </MapContainer>
    {overlay}
    </div>
  );
}

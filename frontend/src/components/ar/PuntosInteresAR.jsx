import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getPuntosInteresAR } from "../../api/client.js";
import { useGpsYBrujula } from "../../hooks/useGpsYBrujula.js";
import { distanciaHaversineMetros, calcularRumbo, diferenciaAngular } from "../../lib/geolocalizacionAR.js";

const CAMPO_VISION_GRADOS = 60; // FOV horizontal aproximado de la cámara trasera

/**
 * Pilar 3 (ANEXO1) — "Puntos de Interés Aumentados": al caminar por el
 * santuario aparecen marcadores AR en pantalla ("Árbol Centenario",
 * "Zona de Hibernación 2025", etc).
 *
 * NOTA HONESTA: esto es AR basada en GPS + brújula (Geolocation +
 * Device Orientation APIs), no anclaje visual 6DoF tipo ARKit/ARCore.
 * Es la técnica estándar y gratuita para "point of interest AR" al
 * aire libre (usada por apps como Wikitude POI o Google Live View),
 * sin depender de 8th Wall ni de licencias de pago.
 */
export default function PuntosInteresAR() {
  const [puntos, setPuntos] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);
  const { posicion, rumbo, permisoBrujula, solicitarPermisoBrujula, error } = useGpsYBrujula();

  useEffect(() => {
    getPuntosInteresAR().then(setPuntos).catch((e) => console.warn("Puntos AR:", e));
  }, []);

  const iniciar = async () => {
    await solicitarPermisoBrujula();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamaraLista(true);
    } catch {
      alert("No se pudo acceder a la cámara.");
    }
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const marcadoresVisibles =
    posicion && rumbo != null
      ? puntos
          .map((p) => {
            const distancia = distanciaHaversineMetros(posicion.latitud, posicion.longitud, p.latitud, p.longitud);
            const rumboAlPunto = calcularRumbo(posicion.latitud, posicion.longitud, p.latitud, p.longitud);
            const desviacion = diferenciaAngular(rumbo, rumboAlPunto);
            return { ...p, distancia, desviacion };
          })
          .filter((p) => Math.abs(p.desviacion) <= CAMPO_VISION_GRADOS / 2 && p.distancia <= 3000)
      : [];

  return (
    <div className="puntos-interes-ar">
      <h3 className="font-titulo">📍 Puntos de Interés Aumentados</h3>
      <p className="texto-secundario">
        Apunta tu cámara mientras caminas por el santuario para descubrir
        árboles centenarios y zonas de hibernación cercanas.
      </p>

      {!camaraLista ? (
        <button className="boton-primario" onClick={iniciar}>🧭 Activar AR de campo</button>
      ) : (
        <div className="ar-escenario">
          <video ref={videoRef} autoPlay playsInline muted className="ar-video" />
          {marcadoresVisibles.map((m) => (
            <motion.div
              key={m.id_punto}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ar-marcador tarjeta-cristal"
              style={{
                left: `${50 + (m.desviacion / (CAMPO_VISION_GRADOS / 2)) * 40}%`,
              }}
            >
              <span className="ar-marcador-icono">{m.icono_emoji}</span>
              <strong>{m.nombre}</strong>
              <span>{Math.round(m.distancia)} m</span>
            </motion.div>
          ))}
          {!posicion && <p className="ar-aviso">Obteniendo tu ubicación GPS…</p>}
          {posicion && rumbo == null && (
            <p className="ar-aviso">
              {permisoBrujula === "denied"
                ? "Permiso de brújula denegado. Actívalo en ajustes del navegador."
                : "Calibrando brújula…"}
            </p>
          )}
          {posicion && rumbo != null && marcadoresVisibles.length === 0 && (
            <p className="ar-aviso">Ningún punto de interés en esta dirección. Gira lentamente el teléfono.</p>
          )}
        </div>
      )}
      {error && <p className="ar-aviso">{error}</p>}
    </div>
  );
}

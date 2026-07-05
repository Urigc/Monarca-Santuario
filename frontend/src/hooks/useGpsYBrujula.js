import { useEffect, useState } from "react";

/**
 * Combina Geolocation API (posición) + Device Orientation API (rumbo
 * de la brújula) — las dos APIs web estándar que hacen posible una AR
 * "ligera" sin SDK propietario. En iOS requiere permiso explícito
 * (`DeviceOrientationEvent.requestPermission()`).
 */
export function useGpsYBrujula() {
  const [posicion, setPosicion] = useState(null);
  const [rumbo, setRumbo] = useState(null);
  const [permisoBrujula, setPermisoBrujula] = useState("desconocido");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Este dispositivo no soporta geolocalización.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosicion({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }),
      (e) => setError("No se pudo obtener tu ubicación GPS: " + e.message),
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const solicitarPermisoBrujula = async () => {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const respuesta = await DeviceOrientationEvent.requestPermission();
        setPermisoBrujula(respuesta);
      } catch {
        setPermisoBrujula("denied");
      }
    } else {
      setPermisoBrujula("granted"); // Android / navegadores sin permiso explícito
    }
  };

  useEffect(() => {
    if (permisoBrujula !== "granted") return;
    const handler = (e) => {
      // webkitCompassHeading (iOS Safari) ya viene en grados reales desde el norte
      const heading = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
      if (heading != null) setRumbo(heading);
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [permisoBrujula]);

  return { posicion, rumbo, permisoBrujula, solicitarPermisoBrujula, error };
}

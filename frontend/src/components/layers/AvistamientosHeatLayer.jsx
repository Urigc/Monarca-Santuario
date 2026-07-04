import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

/**
 * Capa 2: Mapa de Calor de Avistamientos (Densidad Dinámica).
 * Sólo recibe registros ya filtrados por el backend
 * (Quality Grade: Research + reportes ciudadanos verificados).
 */
export default function AvistamientosHeatLayer({ avistamientos }) {
  const map = useMap();

  useEffect(() => {
    if (!avistamientos || avistamientos.length === 0) return;

    const puntos = avistamientos.map((a) => [
      a.latitud,
      a.longitud,
      Math.min(a.conteo_estimado_clusters / 10, 1) || 0.3,
    ]);

    const capaCalor = L.heatLayer(puntos, {
      radius: 30,
      blur: 20,
      maxZoom: 16,
      gradient: { 0.2: "#fff3cd", 0.5: "#ff8c42", 0.8: "#c0392b" },
    }).addTo(map);

    return () => map.removeLayer(capaCalor);
  }, [avistamientos, map]);

  return null;
}

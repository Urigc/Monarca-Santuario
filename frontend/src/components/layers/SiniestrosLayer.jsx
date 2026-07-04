import React, { useEffect, useState } from "react";
import { GeoJSON, Popup } from "react-leaflet";
import { getSiniestros, getBrechasCortafuego } from "../../api/client.js";

/**
 * Capa 7: Siniestros e Incendios.
 * Representación geométrica (polígonos) de áreas devastadas en
 * temporadas secas previas, cruzadas con líneas de brechas cortafuego
 * activas mantenidas por los ejidatarios.
 */
export default function SiniestrosLayer() {
  const [siniestros, setSiniestros] = useState([]);
  const [brechas, setBrechas] = useState([]);

  useEffect(() => {
    getSiniestros().then(setSiniestros).catch((e) => console.warn("Siniestros:", e));
    getBrechasCortafuego().then(setBrechas).catch((e) => console.warn("Brechas:", e));
  }, []);

  return (
    <>
      {siniestros.map((s) => (
        <GeoJSON
          key={`siniestro-${s.id_siniestro}`}
          data={s.poligono_geojson}
          style={{ color: "#8d1a10", fillColor: "#8d1a10", fillOpacity: 0.35, weight: 1 }}
        >
          <Popup>
            Temporada: {s.temporada}
            <br />
            Área devastada: {s.area_hectareas} ha
          </Popup>
        </GeoJSON>
      ))}

      {brechas.map((b) => (
        <GeoJSON
          key={`brecha-${b.id_brecha}`}
          data={b.linea_geojson}
          style={{ color: "#f1c40f", weight: 3, dashArray: "6 4" }}
        >
          <Popup>Brecha cortafuego: {b.nombre}</Popup>
        </GeoJSON>
      ))}
    </>
  );
}

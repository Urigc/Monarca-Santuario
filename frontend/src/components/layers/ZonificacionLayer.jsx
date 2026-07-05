import React from "react";
import { Rectangle, Popup } from "react-leaflet";

/** Capa 1: Delimitación Poligonal (Zonificación) — Núcleo vs Amortiguamiento. */
export default function ZonificacionLayer({ sectores, onMarcaClic }) {
  return (
    <>
      {sectores.map((s) => (
        <Rectangle
          key={s.id_sector}
          bounds={[
            [s.lat_min, s.lng_min],
            [s.lat_max, s.lng_max],
          ]}
          pathOptions={{
            color: s.tipo_zona === "Núcleo" ? "#2f5233" : "#e67e22",
            weight: 2,
            fillOpacity: 0.08,
          }}
          eventHandlers={onMarcaClic ? { click: onMarcaClic } : undefined}
        >
          <Popup>
            <strong>{s.nombre_sector}</strong>
            <br />
            Zona: {s.tipo_zona}
            <br />
            Área: {s.area_hectareas} ha
          </Popup>
        </Rectangle>
      ))}
    </>
  );
}

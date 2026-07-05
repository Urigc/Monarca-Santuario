import React from "react";
import { CircleMarker, Popup } from "react-leaflet";

const COLOR_POR_RIESGO = {
  Bajo: "#27ae60",       // ■ Verde: 10°C - 15°C (óptimo)
  Moderado: "#e67e22",   // ■ Naranja: < 4°C o baja humedad
  Crítico: "#c0392b",    // ■ Rojo: < 0°C con frentes fríos
};

/** Capa 3: Semáforo de Riesgo Microclimático (Nodos Térmicos). */
export default function SemaforoMicroclimaLayer({ microclima, sectores, onMarcaClic }) {
  const centroDeSector = (idSector) => {
    const s = sectores.find((sec) => sec.id_sector === idSector);
    if (!s) return null;
    return [(s.lat_min + s.lat_max) / 2, (s.lng_min + s.lng_max) / 2];
  };

  return (
    <>
      {microclima.map((registro) => {
        const centro = centroDeSector(registro.id_sector);
        if (!centro) return null;
        return (
          <CircleMarker
            key={registro.id_registro}
            center={centro}
            radius={14}
            pathOptions={{
              color: COLOR_POR_RIESGO[registro.riesgo_congelacion] || "#999",
              fillColor: COLOR_POR_RIESGO[registro.riesgo_congelacion] || "#999",
              fillOpacity: 0.75,
            }}
            eventHandlers={onMarcaClic ? { click: onMarcaClic } : undefined}
          >
            <Popup>
              <strong>Riesgo: {registro.riesgo_congelacion}</strong>
              <br />
              Temperatura: {registro.temperatura_c}°C
              <br />
              Humedad: {registro.humedad_relativa}%
              <br />
              Fuente: {registro.fuente_api}
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

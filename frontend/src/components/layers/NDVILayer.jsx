import React from "react";
import { Rectangle, Popup } from "react-leaflet";

/** Interpola de rojo (NDVI bajo/tala) a verde intenso (follaje saludable). */
function colorPorNdvi(valor) {
  if (valor >= 0.6) return "#1b5e20";
  if (valor >= 0.4) return "#66bb6a";
  if (valor >= 0.2) return "#ffca28";
  return "#c0392b"; // pérdida súbita de verdor -> posible tala/plaga
}

/** Capa 4: Superficie de Salud Forestal (Gradiente NDVI). */
export default function NDVILayer({ ndvi, sectores }) {
  return (
    <>
      {ndvi.map((medicion) => {
        const sector = sectores.find((s) => s.id_sector === medicion.id_sector);
        if (!sector) return null;
        return (
          <Rectangle
            key={medicion.id_medicion}
            bounds={[
              [sector.lat_min, sector.lng_min],
              [sector.lat_max, sector.lng_max],
            ]}
            pathOptions={{
              color: colorPorNdvi(medicion.valor_ndvi),
              fillColor: colorPorNdvi(medicion.valor_ndvi),
              fillOpacity: 0.45,
              weight: 1,
            }}
          >
            <Popup>
              <strong>{sector.nombre_sector}</strong>
              <br />
              NDVI: {medicion.valor_ndvi}
              <br />
              {medicion.alerta_deforestacion && (
                <span style={{ color: "#c0392b", fontWeight: "bold" }}>
                  ⚠️ Alerta de posible deforestación
                </span>
              )}
            </Popup>
          </Rectangle>
        );
      })}
    </>
  );
}

import React, { useEffect, useState } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { getAuditoriaForestal } from "../../api/client.js";

const COLOR_POR_TIPO = {
  "Avistamiento tala": "#c0392b",
  "Plaga descortezador": "#e67e22",
  "Basura": "#7f8c8d",
};

/**
 * Capa 6: Auditoría Forestal Comunitaria.
 * Marcadores "parpadeantes" (vía animación CSS pulse) derivados de la
 * interacción directa de los pobladores, en proceso de revisión
 * (estado_validacion = 'Pendiente' hasta que el comité ejidal vota).
 */
export default function AuditoriaLayer() {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    getAuditoriaForestal()
      .then(setReportes)
      .catch((e) => console.warn("No se pudo cargar auditoría forestal:", e));
  }, []);

  return (
    <>
      {reportes.map((r) => (
        <CircleMarker
          key={r.id_reporte}
          center={[r.latitud, r.longitud]}
          radius={r.estado_validacion === "Pendiente" ? 10 : 7}
          pathOptions={{
            color: COLOR_POR_TIPO[r.tipo_suceso] || "#555",
            fillColor: COLOR_POR_TIPO[r.tipo_suceso] || "#555",
            fillOpacity: r.estado_validacion === "Pendiente" ? 0.9 : 0.4,
            className: r.estado_validacion === "Pendiente" ? "marcador-parpadeante" : "",
          }}
        >
          <Popup>
            <strong>{r.tipo_suceso}</strong>
            <br />
            {r.descripcion}
            <br />
            Estado: <strong>{r.estado_validacion}</strong>
            <br />
            Reportado por: {r.usuario_rol}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

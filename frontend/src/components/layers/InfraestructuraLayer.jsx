import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const iconoAcceso = L.divIcon({
  className: "icono-infraestructura",
  html: "🥾",
  iconSize: [24, 24],
});

/**
 * Capa 5: Infraestructura Turística y Capacidad de Carga.
 * NOTA DE INGENIERÍA: la tabla `infraestructura_turistica` del script SQL
 * (Sección 7) no incluye latitud/longitud. Se recomienda agregar las
 * columnas `latitud NUMERIC(9,6)` y `longitud NUMERIC(9,6)` a esa tabla
 * para posicionar cada nodo correctamente; mientras tanto se usa el
 * centro del santuario como marcador provisional.
 */
export default function InfraestructuraLayer({ nodos }) {
  return (
    <>
      {nodos.map((n) => {
        const ocupacion = Math.round((n.visitantes_activos_conteo / n.capacidad_max_personas) * 100);
        return (
          <Marker
            key={n.id_nodo}
            position={[n.latitud || 19.1186, n.longitud || -100.0411]}
            icon={iconoAcceso}
          >
            <Popup>
              <strong>{n.nombre_paraje}</strong>
              <br />
              Ocupación: {n.visitantes_activos_conteo} / {n.capacidad_max_personas} ({ocupacion}%)
              <br />
              {ocupacion >= 90 && (
                <span style={{ color: "#c0392b" }}>⚠️ Riesgo de estrés acústico para la colonia</span>
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

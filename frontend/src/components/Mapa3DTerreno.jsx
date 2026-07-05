import React, { useEffect, useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map as MapaBase } from "react-map-gl/maplibre";
import { ColumnLayer, ScatterplotLayer } from "@deck.gl/layers";
import { TerrainLayer } from "@deck.gl/geo-layers";
import "maplibre-gl/dist/maplibre-gl.css";
import { PALETA_MONARCA_RGB } from "../theme/colors.js";
import { getAvistamientos, getMicroclimaActual, getSectores } from "../api/client.js";

const CENTRO_SANTUARIO = { longitude: -100.0411, latitude: 19.1186, zoom: 14, pitch: 55, bearing: -18 };

// Estilo base vectorial gratuito (sin API key) para MapLibre
const ESTILO_MAPA = "https://demotiles.maplibre.org/style.json";

// Servicio público de elevación (AWS Terrain Tiles, uso gratuito con atribución)
const TERRAIN_IMAGE = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const TERRAIN_URL_ELEV_ENCODING = "terrarium";

/**
 * Pilar 2 (ANEXO1): "Mapa 3D con Deck.gl: Visualización de elevación
 * del terreno, capas de vegetación en 3D".
 * Complementa (no reemplaza) el Dashboard 2D de Leaflet: aquí se
 * visualiza la topografía real de Piedra Herrada con columnas 3D que
 * representan densidad de avistamientos y riesgo microclimático.
 */
export default function Mapa3DTerreno() {
  const [avistamientos, setAvistamientos] = useState([]);
  const [microclima, setMicroclima] = useState([]);
  const [sectores, setSectores] = useState([]);

  useEffect(() => {
    getAvistamientos().then(setAvistamientos).catch(() => {});
    getMicroclimaActual().then(setMicroclima).catch(() => {});
    getSectores().then(setSectores).catch(() => {});
  }, []);

  const capas = useMemo(() => {
    const lista = [
      new TerrainLayer({
        id: "terreno-piedra-herrada",
        minZoom: 0,
        maxZoom: 15,
        strategy: "no-overlap",
        elevationDecoder: {
          rScaler: 256, gScaler: 1, bScaler: 1 / 256, offset: -32768,
        },
        elevationData: TERRAIN_IMAGE,
        texture: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c"],
        color: PALETA_MONARCA_RGB.verde,
      }),
      new ColumnLayer({
        id: "columnas-avistamientos",
        data: avistamientos,
        diskResolution: 12,
        radius: 20,
        extruded: true,
        pickable: true,
        elevationScale: 60,
        getPosition: (d) => [d.longitud, d.latitud],
        getElevation: (d) => d.conteo_estimado_clusters || 1,
        getFillColor: [...PALETA_MONARCA_RGB.naranja, 210],
      }),
      new ScatterplotLayer({
        id: "puntos-riesgo-microclima",
        data: microclima
          .map((m) => {
            const sector = sectores.find((s) => s.id_sector === m.id_sector);
            if (!sector) return null;
            return {
              ...m,
              longitud: (sector.lng_min + sector.lng_max) / 2,
              latitud: (sector.lat_min + sector.lat_max) / 2,
            };
          })
          .filter(Boolean),
        pickable: true,
        radiusMinPixels: 10,
        getPosition: (d) => [d.longitud, d.latitud],
        getFillColor: (d) =>
          d.riesgo_congelacion === "Crítico" ? [192, 57, 43, 220]
          : d.riesgo_congelacion === "Moderado" ? [230, 126, 34, 220]
          : [39, 174, 96, 220],
      }),
    ];
    return lista;
  }, [avistamientos, microclima, sectores]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <DeckGL
        initialViewState={CENTRO_SANTUARIO}
        controller={true}
        layers={capas}
        getTooltip={({ object }) =>
          object &&
          (object.riesgo_congelacion
            ? `Riesgo: ${object.riesgo_congelacion} · ${object.temperatura_c}°C`
            : object.conteo_estimado_clusters
            ? `Clusters estimados: ${object.conteo_estimado_clusters}`
            : null)
        }
      >
        <MapaBase mapStyle={ESTILO_MAPA} />
      </DeckGL>
      <div className="leyenda-3d tarjeta-cristal">
        <strong>Vista 3D — Piedra Herrada</strong>
        <p>Columnas naranjas: densidad de avistamientos. Puntos: riesgo microclimático.</p>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map as MapaBase } from "react-map-gl/maplibre";
import { ColumnLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { TerrainLayer } from "@deck.gl/geo-layers";
import { AmbientLight, DirectionalLight, LightingEffect } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";
import { getAvistamientos, getMicroclimaActual, getSectores } from "../api/client.js";

// Ajustes2.0 punto 5: zoom inicial corregido
const VISTA_INICIAL = {
  longitude: -100.04,
  latitude: 19.12,
  zoom: 14.2,
  pitch: 60,
  bearing: 0,
};

// Estilo vectorial base gratuito (sin API key)
const ESTILO_MAPA = "https://demotiles.maplibre.org/style.json";

// AWS Terrain Tiles (elevación real, uso gratuito con atribución)
const TERRAIN_IMAGE = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

const COLOR_RIESGO = {
  Bajo: [39, 174, 96],     // verde brillante
  Moderado: [255, 200, 30], // amarillo brillante
  Crítico: [255, 45, 45],   // rojo brillante
};

/**
 * Ajustes2.0 — Prompt de corrección del Mapa 3D, punto por punto:
 * 1) Paleta verde bosque con elevación visible (textura real de OSM
 *    sobre el TerrainLayer en vez de un tinte plano oscuro).
 * 2) Iluminación direccional -> LightingEffect (Ambient + Directional)
 *    para generar sombras y relieve real sobre la malla del terreno.
 * 3) Columnas de avistamientos: naranja brillante #FF6B35, altura
 *    proporcional a la densidad de clusters.
 * 4) Riesgo microclimático: esferas rojo/amarillo/verde con efecto
 *    "glow" (halo translúcido apilado bajo el punto sólido).
 * 5) Vista inicial: lat 19.12, lng -100.04, pitch 60, bearing 0.
 * 6) TerrainLayer con elevationScale: 50.
 * 7) TextLayer con fondo oscuro semi-transparente por marcador.
 * 8) Orbit-like control: dragRotate/touchRotate habilitados para que
 *    el usuario rote la vista libremente (deck.gl MapView no ofrece
 *    "orbit" puro como OrbitView, pero con dragRotate se logra el
 *    mismo efecto de giro alrededor del terreno).
 * 9) TerrainLayer con datos reales de elevación (Terrarium/AWS).
 * 10) Panel de leyenda flotante explicando cada elemento visual.
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

  // Punto 2: iluminación direccional para relieve/sombras reales
  const efectosLuz = useMemo(() => {
    const ambient = new AmbientLight({ color: [255, 255, 255], intensity: 1.0 });
    const direccional = new DirectionalLight({
      color: [255, 250, 230],
      intensity: 2.2,
      direction: [-2, -4, -1], // luz de media mañana, realza el relieve
    });
    return [new LightingEffect({ ambient, direccional })];
  }, []);

  const microclimaConCoordenadas = useMemo(
    () =>
      microclima
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
    [microclima, sectores]
  );

  const capas = useMemo(() => {
    return [
      // Punto 1, 6, 9: terreno con elevación real y textura de mapa base
      new TerrainLayer({
        id: "terreno-piedra-herrada",
        minZoom: 0,
        maxZoom: 15,
        strategy: "no-overlap",
        elevationDecoder: { rScaler: 256, gScaler: 1, bScaler: 1 / 256, offset: -32768 },
        elevationData: TERRAIN_IMAGE,
        elevationScale: 50,
        texture: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c"],
        material: { ambient: 0.4, diffuse: 0.7, shininess: 20, specularColor: [200, 220, 200] },
      }),

      // Punto 3: columnas naranja brillante, altura = densidad
      new ColumnLayer({
        id: "columnas-avistamientos",
        data: avistamientos,
        diskResolution: 16,
        radius: 22,
        extruded: true,
        pickable: true,
        elevationScale: 40,
        getPosition: (d) => [d.longitud, d.latitud],
        getElevation: (d) => (d.conteo_estimado_clusters || 1) * 10,
        getFillColor: [255, 107, 53, 235], // #FF6B35 brillante
        material: { ambient: 0.5, diffuse: 0.8, shininess: 40, specularColor: [255, 200, 150] },
      }),

      // Punto 4: halo/glow bajo cada esfera de riesgo microclimático
      new ScatterplotLayer({
        id: "glow-riesgo-microclima",
        data: microclimaConCoordenadas,
        getPosition: (d) => [d.longitud, d.latitud],
        getRadius: 55,
        radiusUnits: "pixels",
        getFillColor: (d) => [...(COLOR_RIESGO[d.riesgo_congelacion] || [150, 150, 150]), 60],
        stroked: false,
      }),
      new ScatterplotLayer({
        id: "puntos-riesgo-microclima",
        data: microclimaConCoordenadas,
        pickable: true,
        getPosition: (d) => [d.longitud, d.latitud],
        getRadius: 16,
        radiusUnits: "pixels",
        getFillColor: (d) => [...(COLOR_RIESGO[d.riesgo_congelacion] || [150, 150, 150]), 255],
        getLineColor: [255, 255, 255, 200],
        lineWidthMinPixels: 1.5,
        stroked: true,
      }),

      // Punto 7: labels con fondo oscuro semi-transparente
      new TextLayer({
        id: "labels-avistamientos",
        data: avistamientos,
        getPosition: (d) => [d.longitud, d.latitud],
        getText: (d) => `${d.conteo_estimado_clusters || 1} clusters`,
        getSize: 13,
        getColor: [255, 255, 255, 255],
        getPixelOffset: [0, -26],
        background: true,
        getBackgroundColor: [26, 26, 46, 190],
        backgroundPadding: [6, 3],
        fontFamily: "Inter, sans-serif",
      }),
      new TextLayer({
        id: "labels-microclima",
        data: microclimaConCoordenadas,
        getPosition: (d) => [d.longitud, d.latitud],
        getText: (d) => `${d.riesgo_congelacion} · ${d.temperatura_c}°C`,
        getSize: 12,
        getColor: [255, 255, 255, 255],
        getPixelOffset: [0, 22],
        background: true,
        getBackgroundColor: [26, 26, 46, 190],
        backgroundPadding: [6, 3],
        fontFamily: "Inter, sans-serif",
      }),
    ];
  }, [avistamientos, microclimaConCoordenadas]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <DeckGL
        initialViewState={VISTA_INICIAL}
        controller={{ dragRotate: true, touchRotate: true, inertia: true }}
        layers={capas}
        effects={efectosLuz}
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
        <ul className="leyenda-3d-lista">
          <li><span className="leyenda-punto" style={{ background: "#FF6B35" }} /> Columna naranja: densidad de avistamientos</li>
          <li><span className="leyenda-punto" style={{ background: "#27ae60" }} /> Verde: riesgo bajo (óptimo)</li>
          <li><span className="leyenda-punto" style={{ background: "#ffc81e" }} /> Amarillo: riesgo moderado</li>
          <li><span className="leyenda-punto" style={{ background: "#ff2d2d" }} /> Rojo: riesgo crítico</li>
        </ul>
        <p className="leyenda-3d-tip">Arrastra con el botón derecho (o dos dedos) para rotar la vista.</p>
      </div>
    </div>
  );
}

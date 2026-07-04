-- ====================================================================
-- MIGRACIÓN V2.1 — Ajustes de ingeniería detectados al implementar el
-- Dashboard Cartográfico (Sección 5, Capas 5 y 7 del plano maestro).
-- Ejecutar después de 01_schema.sql y 02_seed.sql.
-- ====================================================================

-- Capa 5: cada nodo de infraestructura necesita coordenadas propias
ALTER TABLE infraestructura_turistica
    ADD COLUMN latitud NUMERIC(9,6),
    ADD COLUMN longitud NUMERIC(9,6);

UPDATE infraestructura_turistica
SET latitud = 19.1186, longitud = -100.0411
WHERE nombre_paraje = 'Paraje Los Oyameles - Acceso Principal';

-- Capa 7: Siniestros e Incendios — polígonos de áreas devastadas y
-- líneas de brechas cortafuego (no existían tablas dedicadas en V2.0)
CREATE TABLE siniestros_incendios (
    id_siniestro SERIAL PRIMARY KEY,
    id_sector INT REFERENCES sectores_bosque(id_sector) ON DELETE CASCADE,
    temporada VARCHAR(20) NOT NULL, -- ej. '2025-Seca'
    area_hectareas NUMERIC(6,2),
    poligono_geojson JSONB NOT NULL, -- GeoJSON del área devastada
    fecha_registro DATE DEFAULT CURRENT_DATE
);

CREATE TABLE brechas_cortafuego (
    id_brecha SERIAL PRIMARY KEY,
    id_sector INT REFERENCES sectores_bosque(id_sector) ON DELETE CASCADE,
    nombre VARCHAR(100),
    linea_geojson JSONB NOT NULL, -- GeoJSON LineString mantenido por ejidatarios
    activa BOOLEAN DEFAULT TRUE
);

-- Capa 6: Auditoría Forestal Comunitaria reutiliza `reportes_comunitarios`
-- filtrando por tipo_suceso IN ('Avistamiento tala', 'Plaga descortezador'),
-- por lo que no requiere tabla nueva; se deja este comentario como
-- documentación de la decisión de diseño para futuras iteraciones.

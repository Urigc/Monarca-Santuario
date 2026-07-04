-- ====================================================================
-- SCRIPT DE BASE DE DATOS UNIFICADO: SANTUARIO DIGITAL MONARCA
-- RDBMS: PostgreSQL (Compatible con Supabase Free Tier)
-- ====================================================================

-- 1. TIPOS ENUMERADOS PARA RESTRICCIONES CONTROLADAS
CREATE TYPE nivel_riesgo_env AS ENUM ('Bajo', 'Moderado', 'Crítico');
CREATE TYPE fuente_data AS ENUM ('iNaturalist', 'Reporte Ciudadano', 'Monitoreo Ejidal');
CREATE TYPE estado_alerta_env AS ENUM ('Activa', 'Resuelta');
CREATE TYPE estado_reporte AS ENUM ('Pendiente', 'Verificado', 'Falso');

-- 2. TABLA DE COMUNIDADES / EJIDOS LOCALES
CREATE TABLE comunidades (
    id_comunidad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    latitud_centro NUMERIC(9,6),
    longitud_centro NUMERIC(9,6),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE SECTORES DEL BOSQUE (ZONIFICACIÓN TERRITORIAL)
CREATE TABLE sectores_bosque (
    id_sector SERIAL PRIMARY KEY,
    id_comunidad INT REFERENCES comunidades(id_comunidad) ON DELETE SET NULL,
    nombre_sector VARCHAR(100) NOT NULL,
    tipo_zona VARCHAR(50) NOT NULL CHECK (tipo_zona IN ('Núcleo', 'Amortiguamiento')),
    lat_min NUMERIC(9,6) NOT NULL,
    lat_max NUMERIC(9,6) NOT NULL,
    lng_min NUMERIC(9,6) NOT NULL,
    lng_max NUMERIC(9,6) NOT NULL,
    area_hectareas NUMERIC(6,2)
);

-- 4. TABLA DE REGISTROS MICROCLIMÁTICOS HISTÓRICOS Y TIEMPO REAL
CREATE TABLE registros_microclima (
    id_registro BIGSERIAL PRIMARY KEY,
    id_sector INT REFERENCES sectores_bosque(id_sector) ON DELETE CASCADE,
    fecha_hora TIMESTAMP NOT NULL,
    temperatura_c NUMERIC(4,2) NOT NULL,
    humedad_relativa INT CHECK (humedad_relativa BETWEEN 0 AND 100),
    precipitacion_mm NUMERIC(5,2) DEFAULT 0.00,
    riesgo_congelacion nivel_riesgo_env NOT NULL,
    fuente_api VARCHAR(50) DEFAULT 'OpenWeatherAPI'
);

-- 5. TABLA DE AVISTAMIENTOS Y DENSIDAD DE LA COLONIA
CREATE TABLE avistamientos_monarca (
    id_avistamiento SERIAL PRIMARY KEY,
    id_sector INT REFERENCES sectores_bosque(id_sector) ON DELETE SET NULL,
    fecha_observacion DATE NOT NULL,
    conteo_estimado_clusters INT NOT NULL CHECK (conteo_estimado_clusters >= 0),
    latitud NUMERIC(9,6) NOT NULL,
    longitud NUMERIC(9,6) NOT NULL,
    fuente_origen fuente_data DEFAULT 'Reporte Ciudadano',
    observaciones TEXT
);

-- 6. TABLA DE SALUD FORESTAL E ÍNDICES DE VEGETACIÓN (NDVI)
CREATE TABLE salud_forestal_ndvi (
    id_medicion SERIAL PRIMARY KEY,
    id_sector INT REFERENCES sectores_bosque(id_sector) ON DELETE CASCADE,
    fecha_analisis DATE NOT NULL,
    valor_ndvi NUMERIC(3,2) NOT NULL CHECK (valor_ndvi BETWEEN -1.00 AND 1.00),
    alerta_deforestacion BOOLEAN DEFAULT FALSE
);

-- 7. TABLA DE ALERTAS COMUNITARIAS GENERALES
CREATE TABLE alertas_comunitarias (
    id_alerta SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_riesgo VARCHAR(50) NOT NULL, -- 'Helada extrema', 'Tala detectada', 'Incendio'
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado estado_alerta_env DEFAULT 'Activa'
);

-- 8. TABLA DE REPORTES COMUNITARIOS DIRECTOS (INTERACCIÓN OFFLINE-FIRST)
CREATE TABLE reportes_comunitarios (
    id_reporte SERIAL PRIMARY KEY,
    id_sector INT REFERENCES sectores_bosque(id_sector) ON DELETE SET NULL,
    usuario_rol VARCHAR(50) DEFAULT 'Poblador Anónimo',
    tipo_suceso VARCHAR(100) NOT NULL, -- 'Avistamiento tala', 'Plaga descortezador', 'Incendio'
    descripcion TEXT NOT NULL,
    latitud NUMERIC(9,6) NOT NULL,
    longitud NUMERIC(9,6) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_validacion estado_reporte DEFAULT 'Pendiente'
);

-- 9. TABLA DE VALIDACIÓN CRUZADA EJIDAL (SISTEMA DE VOTACIÓN INTERACTIVO)
CREATE TABLE validaciones_ejidales (
    id_validacion SERIAL PRIMARY KEY,
    id_reporte INT REFERENCES reportes_comunitarios(id_reporte) ON DELETE CASCADE,
    validador_credencial VARCHAR(100) NOT NULL, -- Token o firma de credencial de asamblea
    voto_positivo BOOLEAN NOT NULL, -- TRUE = Verídico, FALSE = Desmentido
    comentario_revision TEXT,
    fecha_validacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_reporte, validador_credencial) -- Previene doble voto por el mismo usuario
);

-- 10. TABLA DEL MOTOR DE CONCLUSIONES AUTOMATIZADAS (INSIGHTS ENGINE)
CREATE TABLE conclusiones_analitica (
    id_conclusion SERIAL PRIMARY KEY,
    id_sector INT REFERENCES sectores_bosque(id_sector) ON DELETE CASCADE,
    fecha_generacion DATE DEFAULT CURRENT_DATE,
    metrica_correlacionada VARCHAR(100), -- 'NDVI vs Caida de Temperatura'
    narrativa_insights TEXT NOT NULL,
    nivel_urgencia nivel_riesgo_env DEFAULT 'Bajo'
);

-- 11. TABLA DE INFRAESTRUCTURA Y CAPACIDAD DE CARGA TURÍSTICA
CREATE TABLE infraestructura_turistica (
    id_nodo SERIAL PRIMARY KEY,
    nombre_paraje VARCHAR(100) NOT NULL,
    capacidad_max_personas INT NOT NULL,
    visitantes_activos_conteo INT DEFAULT 0 CHECK (visitantes_activos_conteo >= 0),
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. ÍNDICES DE OPTIMIZACIÓN GEOGRÁFICA Y TEMPORAL
CREATE INDEX idx_clima_fecha ON registros_microclima(fecha_hora DESC);
CREATE INDEX idx_avistamientos_coord ON avistamientos_monarca(latitud, longitud);
CREATE INDEX idx_reportes_estado ON reportes_comunitarios(estado_validacion);

-- 13. HABILITAR SUPABASE REALTIME SOBRE ALERTAS CRÍTICAS
-- (requerido por la Sección 8 del plano maestro: suscripción en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE alertas_comunitarias;

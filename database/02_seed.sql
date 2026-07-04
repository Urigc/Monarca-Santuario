-- ====================================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA (SEED DATA)
-- Ejecutar DESPUÉS de 01_schema.sql
-- ====================================================================

-- 1. INSERTAR COMUNIDAD BASE
INSERT INTO comunidades (nombre, descripcion, latitud_centro, longitud_centro)
VALUES ('San Mateo Almomoloa', 'Zona ejidal principal colindante con el núcleo de Piedra Herrada', 19.1186, -100.0411);

-- 2. INSERTAR SECTORES DE CONTROL (corregido: tipo_zona válido 'Núcleo')
INSERT INTO sectores_bosque (id_comunidad, nombre_sector, tipo_zona, lat_min, lat_max, lng_min, lng_max, area_hectareas)
VALUES (1, 'Piedra Herrada Norte', 'Núcleo', 19.1100, 19.1300, -100.0500, -100.0300, 120.50);

INSERT INTO sectores_bosque (id_comunidad, nombre_sector, tipo_zona, lat_min, lat_max, lng_min, lng_max, area_hectareas)
VALUES (1, 'San Mateo Este', 'Amortiguamiento', 19.1050, 19.1180, -100.0300, -100.0150, 85.30);

-- 3. INSERTAR NODO DE INFRAESTRUCTURA TURÍSTICA
INSERT INTO infraestructura_turistica (nombre_paraje, capacidad_max_personas, visitantes_activos_conteo)
VALUES ('Paraje Los Oyameles - Acceso Principal', 250, 42);

-- 4. INSERTAR UN REPORTE CIUDADANO EN ESTADO PENDIENTE
INSERT INTO reportes_comunitarios (id_sector, usuario_rol, tipo_suceso, descripcion, latitud, longitud, estado_validacion)
VALUES (1, 'Poblador Local', 'Plaga descortezador', 'Avistamiento de brote activo en tres árboles jóvenes caídos.', 19.1215, -100.0432, 'Pendiente');

-- 5. INSERTAR REGISTRO MICROCLIMÁTICO DE EJEMPLO (para poblar el semáforo de riesgo)
INSERT INTO registros_microclima (id_sector, fecha_hora, temperatura_c, humedad_relativa, precipitacion_mm, riesgo_congelacion)
VALUES (1, CURRENT_TIMESTAMP, -0.8, 55, 0.0, 'Crítico');

-- 6. INSERTAR MEDICIÓN NDVI DE EJEMPLO
INSERT INTO salud_forestal_ndvi (id_sector, fecha_analisis, valor_ndvi, alerta_deforestacion)
VALUES (1, CURRENT_DATE, 0.62, FALSE);

-- 7. INSERTAR AVISTAMIENTO DE EJEMPLO
INSERT INTO avistamientos_monarca (id_sector, fecha_observacion, conteo_estimado_clusters, latitud, longitud, fuente_origen, observaciones)
VALUES (1, CURRENT_DATE, 14, 19.1180, -100.0410, 'iNaturalist', 'Cluster denso reportado con Quality Grade: Research');

-- 8. INSERTAR UNA CONCLUSIÓN PRE-COMPUTADA POR EL MOTOR DE ANALÍTICA
INSERT INTO conclusiones_analitica (id_sector, metrica_correlacionada, narrativa_insights, nivel_urgencia)
VALUES (1, 'NDVI vs Caida de Temperatura', 'Alerta de Desviación de Hábitat: El sector Piedra Herrada Norte presentó un descenso del 8% en el índice NDVI emparejado con una dispersión total de avistamientos hacia el sector San Mateo Este. Patrón correlacionado con perturbación humana o presencia de plaga latente. Se sugiere inspección por brigada ejidal.', 'Moderado');

-- 9. INSERTAR ALERTA CRÍTICA (dispara Supabase Realtime hacia el frontend)
INSERT INTO alertas_comunitarias (titulo, descripcion, tipo_riesgo, estado)
VALUES ('Riesgo de Congelación Nocturna', 'Temperatura registrada de -0.8°C en Piedra Herrada Norte. Riesgo crítico para la colonia.', 'Helada extrema', 'Activa');

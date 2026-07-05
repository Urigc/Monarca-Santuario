-- ====================================================================
-- MIGRACIÓN V2.2 — Biblioteca del Bosque (Pilar 1, ANEXO1)
-- Ejecutar después de 03_migracion_v2.1.sql.
--
-- NOTA: el ANEXO1 pedía originalmente un tipo 'quiz' y un componente de
-- quizzes interactivos. Se descarta explícitamente por instrucción del
-- cliente ("LO DE LOS QUIZ NO ME ES MUY ATRACTIVO"): el ENUM de tipo de
-- contenido y la ruta de aprendizaje NO incluyen quizzes; el progreso
-- se mide por exploración/visualización de contenidos, no por examen.
-- ====================================================================

CREATE TYPE tipo_contenido_educativo AS ENUM ('video', 'articulo', 'galeria');
CREATE TYPE nivel_educativo AS ENUM ('basico', 'intermedio', 'avanzado');
CREATE TYPE nivel_ruta_aprendizaje AS ENUM ('Guardián Novato', 'Protector Experto', 'Embajador Monarca');

-- 1. CONTENIDOS DE LA ENCICLOPEDIA MULTIMEDIA INTERACTIVA
CREATE TABLE contenidos_educativos (
    id_contenido SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    tipo tipo_contenido_educativo NOT NULL,
    nivel nivel_educativo NOT NULL DEFAULT 'basico',
    descripcion TEXT,
    url_multimedia TEXT,           -- URL de Cloudinary (free tier)
    duracion_minutos INT,
    orden_secuencial INT NOT NULL DEFAULT 0
);

-- 2. FICHAS DE FLORA DEL SANTUARIO (para la Galería con identificación IA)
CREATE TABLE flora_santuario (
    id_flora SERIAL PRIMARY KEY,
    nombre_comun VARCHAR(100) NOT NULL,
    nombre_cientifico VARCHAR(120),
    descripcion TEXT,
    url_imagen_referencia TEXT,     -- Cloudinary
    -- palabras clave de las categorías de ImageNet/MobileNet que se
    -- asocian a esta especie (heurística de matching, ver
    -- frontend/src/lib/clasificadorFlora.js)
    etiquetas_ia TEXT[]
);

-- 3. CATÁLOGO DE INSIGNIAS DIGITALES (sin quizzes: se otorgan por
--    explorar/completar secciones de contenido, no por examen)
CREATE TABLE catalogo_badges (
    id_badge SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    nivel_asociado nivel_ruta_aprendizaje NOT NULL,
    descripcion TEXT,
    icono_emoji VARCHAR(10) DEFAULT '🦋'
);

-- 4. BADGES OTORGADOS A CADA USUARIO/DISPOSITIVO
CREATE TABLE user_badges (
    id_user_badge SERIAL PRIMARY KEY,
    usuario_identificador VARCHAR(150) NOT NULL, -- device_id local o credencial ejidal
    id_badge INT REFERENCES catalogo_badges(id_badge) ON DELETE CASCADE,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_identificador, id_badge)
);

-- 5. PROGRESO DE CONTENIDOS VISTOS (base para desbloquear badges)
CREATE TABLE progreso_contenidos (
    id_progreso SERIAL PRIMARY KEY,
    usuario_identificador VARCHAR(150) NOT NULL,
    id_contenido INT REFERENCES contenidos_educativos(id_contenido) ON DELETE CASCADE,
    fecha_visto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_identificador, id_contenido)
);

CREATE INDEX idx_progreso_usuario ON progreso_contenidos(usuario_identificador);
CREATE INDEX idx_user_badges_usuario ON user_badges(usuario_identificador);

-- ---------------------------------------------------------------------
-- SEED: catálogo de badges (3 niveles, sin quizzes)
-- ---------------------------------------------------------------------
INSERT INTO catalogo_badges (codigo, nombre, nivel_asociado, descripcion, icono_emoji) VALUES
('GUARDIAN_NOVATO', 'Guardián Novato', 'Guardián Novato', 'Completaste tu primera exploración de la Biblioteca del Bosque.', '🐛'),
('PROTECTOR_EXPERTO', 'Protector Experto', 'Protector Experto', 'Exploraste todo el contenido de nivel intermedio.', '🛡️'),
('EMBAJADOR_MONARCA', 'Embajador Monarca', 'Embajador Monarca', 'Dominas el ciclo completo de vida y conservación de la monarca.', '🦋');

-- SEED: contenidos educativos de ejemplo
INSERT INTO contenidos_educativos (titulo, tipo, nivel, descripcion, url_multimedia, duracion_minutos, orden_secuencial) VALUES
('Ciclo de Vida de la Mariposa Monarca', 'articulo', 'basico', 'Huevo, oruga, crisálida y mariposa: las 4 etapas animadas.', NULL, 3, 1),
('Migración: 4,000 km de vuelo', 'video', 'basico', 'Reel corto sobre la ruta migratoria Canadá-México.', 'https://res.cloudinary.com/demo/video/upload/monarca-migracion.mp4', 1, 2),
('Hibernación en los Oyameles', 'video', 'intermedio', 'Por qué la colonia elige Piedra Herrada para invernar.', 'https://res.cloudinary.com/demo/video/upload/monarca-hibernacion.mp4', 1, 3),
('Amenazas: cambio climático y tala', 'articulo', 'intermedio', 'Factores de riesgo actuales para la colonia.', NULL, 4, 4),
('Galería de Flora del Santuario', 'galeria', 'basico', 'Identifica oyamel, pino y eucalipto con tu cámara.', NULL, 5, 5);

-- SEED: flora con etiquetas heurísticas para el clasificador IA cliente
INSERT INTO flora_santuario (nombre_comun, nombre_cientifico, descripcion, etiquetas_ia) VALUES
('Oyamel', 'Abies religiosa', 'Conífera endémica donde la colonia forma sus clusters de hibernación.', ARRAY['fir', 'conifer', 'pine', 'evergreen']),
('Pino', 'Pinus pseudostrobus', 'Conífera común en la zona de amortiguamiento del santuario.', ARRAY['pine', 'conifer', 'evergreen', 'spruce']),
('Eucalipto', 'Eucalyptus globulus', 'Árbol introducido presente en los bordes del bosque.', ARRAY['eucalyptus', 'tree', 'broadleaf']);

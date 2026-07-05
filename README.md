# 🦋 Santuario Digital Temascaltepec (V2.0)

Plataforma de Inteligencia Territorial Comunitaria para el santuario de la
mariposa monarca en **Piedra Herrada**, Temascaltepec, Estado de México.
Implementación funcional del Plano Maestro de Ingeniería (100% free-tier).

---

## 1. Estructura del repositorio

```
santuario-digital/
├── database/
│   ├── 01_schema.sql          # 11 tablas + tipos ENUM + índices (Supabase)
│   ├── 02_seed.sql            # Datos de prueba
│   └── 03_migracion_v2.1.sql  # lat/lng en infraestructura + tablas de siniestros
├── backend/                   # FastAPI (Render/Railway)
│   ├── app/
│   │   ├── main.py            # App + CORS + scheduler
│   │   ├── config.py          # Umbrales y variables de entorno
│   │   ├── database.py        # Cliente Supabase (Mapeador Proxy Intermedio)
│   │   ├── schemas.py         # Pydantic models
│   │   ├── routers/           # Endpoints REST (7 capas + 3 endpoints críticos)
│   │   ├── services/          # Clientes iNaturalist / OpenWeather / Copernicus
│   │   └── jobs/cron_ingesta.py  # Tarea programada cada 6h
│   ├── requirements.txt
│   └── .env.example
└── frontend/                  # React + Vite + Leaflet (Netlify/Vercel)
    ├── src/
    │   ├── components/        # Dashboard + 7 capas conmutables + formularios
    │   ├── api/client.js      # Cliente REST + lógica offline-first
    │   ├── db/indexedDB.js    # Cola local de reportes sin señal
    │   └── hooks/useOnlineStatus.js
    └── vite.config.js         # PWA (offline caching de tiles y API)
```

---

## 2. Puesta en marcha — Base de datos (Supabase)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** y ejecuta en orden:
   1. `database/01_schema.sql`
   2. `database/02_seed.sql`
   3. `database/03_migracion_v2.1.sql`
3. En **Database → Replication**, confirma que `alertas_comunitarias` quedó
   habilitada para Realtime (el script ya lo hace vía `ALTER PUBLICATION`).
4. Copia tu `Project URL` y `service_role key` (Settings → API).

## 3. Backend (FastAPI)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completa SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENWEATHER_API_KEY, etc.
uvicorn app.main:app --reload --port 8000
```

Prueba rápida: `http://localhost:8000/` y `http://localhost:8000/docs`
(Swagger autogenerado por FastAPI).

**Despliegue gratuito:** Render o Railway → conecta el repo, comando de
arranque `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, agrega las
mismas variables de entorno del `.env`.

### Endpoints críticos implementados (Sección 9)

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/api/v2/reportes/sync` | Sincronización masiva offline-first |
| `GET` | `/api/v2/analitica/insights` | Motor de conclusiones automatizadas |
| `POST` | `/api/v2/reportes/{id}/votar` | Validación cruzada ejidal |

### Endpoints de soporte a las 7 capas del mapa

`GET /api/v2/sectores` · `GET /api/v2/avistamientos` ·
`GET /api/v2/microclima/actual` · `GET /api/v2/ndvi/actual` ·
`GET /api/v2/infraestructura` · `GET /api/v2/alertas` ·
`GET /api/v2/siniestros` · `GET /api/v2/siniestros/brechas-cortafuego` ·
`GET /api/v2/siniestros/auditoria-forestal`

## 4. Frontend (React + Vite + Leaflet)

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm run dev
```

Abre `http://localhost:5173`. El mapa se centra en Piedra Herrada
(19.1186, -100.0411) con las 7 capas conmutables desde el panel izquierdo.

**Despliegue gratuito:** Netlify o Vercel → build command `npm run build`,
publish directory `dist`, variable de entorno `VITE_API_BASE_URL` apuntando
a tu backend en Render/Railway.

---

## 5. Cómo se resolvieron las 3 vulnerabilidades críticas (Sección 3)

- **Rate limiting:** ningún request del navegador toca iNaturalist/OpenWeather
  directamente; sólo `backend/app/jobs/cron_ingesta.py`, cada 6h, escribe en
  Supabase. El frontend siempre lee de `/api/v2/...` (datos locales).
- **Nubosidad en NDVI:** `copernicus_client.obtener_ndvi_sector()` descarta
  imágenes con >15% de nubosidad y retorna el último valor histórico válido
  guardado en `salud_forestal_ndvi`.
- **Vandalismo de datos:** `inaturalist_client.py` filtra estrictamente por
  `quality_grade == "research"`; los reportes ciudadanos nacen en estado
  `Pendiente` y sólo cambian a `Verificado`/`Falso` vía
  `validaciones_ejidales` (consenso de 2 votos netos, `votaciones.py`).

## 6. Offline-First en campo (Sección 6 y 10)

`ReporteForm.jsx` captura GPS nativo. Si `navigator.onLine` es `false`, el
reporte se guarda en IndexedDB (`db/indexedDB.js`). Al disparar el evento
`online`, `useOnlineStatus.js` vacía la cola automáticamente hacia
`POST /api/v2/reportes/sync`. La PWA (`vite-plugin-pwa`) cachea además los
tiles de OpenStreetMap y las últimas respuestas de la API para que el mapa
siga siendo usable sin señal en Piedra Herrada.

## 7. Pendientes sugeridos para producción

- Generar íconos reales `frontend/public/icons/icon-192.png` y `icon-512.png`.
- Sustituir la validación de credencial ejidal (texto libre) por un sistema
  de autenticación real (Supabase Auth + RLS por rol).
- Cargar geometrías reales (GeoJSON) de incendios históricos y brechas
  cortafuego en `siniestros_incendios` / `brechas_cortafuego`.
- Añadir tests automatizados (pytest para el backend, Vitest para el frontend).

---

## 8. Pilar 1 — Biblioteca del Bosque (sin quizzes)

Ejecuta también `database/04_educacion_gamificacion.sql` (después de la
migración 03). Añade:

- `contenidos_educativos`, `flora_santuario`, `catalogo_badges`,
  `user_badges`, `progreso_contenidos`.
- Backend: `routers/educacion.py` → `GET /api/v2/educacion/contenidos`,
  `GET /api/v2/educacion/flora`, `POST /api/v2/educacion/progreso`,
  `GET /api/v2/educacion/badges/{usuario_identificador}`.
- Frontend: `components/biblioteca/` — ciclo de vida animado, reels de
  Cloudinary, galería de flora con identificación por cámara (TensorFlow.js
  + MobileNet, 100% cliente) y ruta de aprendizaje gamificada
  (Guardián Novato → Protector Experto → Embajador Monarca). El progreso
  se mide por **contenidos explorados**, no por exámenes (decisión
  explícita del cliente en ANEXO1).

**Nota de ingeniería honesta:** MobileNet no tiene clases nativas de
"oyamel"; la identificación hace *matching* heurístico entre las
predicciones genéricas del modelo (fir/pine/conifer) y las etiquetas de
`flora_santuario.etiquetas_ia`. Es una aproximación útil y gratuita, no
un clasificador botánico certificado.

## 9. Pilar 2 — Diseño que Emociona

- Paleta monarca, tipografías Poppins/Inter y Tailwind configurados en
  `tailwind.config.js` / `postcss.config.js` / `theme/colors.js`.
- `HeroSection.jsx`: pantalla de bienvenida con gradiente animado
  (o video de fondo si subes `public/videos/monarca-flight.mp4`).
- Micro-interacciones: aleteo de mariposa al hacer clic en cualquier
  marcador del mapa (`MonarcaAleteo.jsx`), confetti al desbloquear un
  badge (`lib/confetti.js`), scroll-reveal con
  `react-intersection-observer` en la Biblioteca del Bosque.
- `Mapa3DTerreno.jsx`: nueva pestaña "Vista 3D del Terreno" con Deck.gl
  (TerrainLayer + columnas de densidad de avistamientos + puntos de
  riesgo microclimático) sobre MapLibre, sin necesidad de API key.
- Modo oscuro automático (`hooks/useDarkMode.js`) con override manual
  persistente, más botón toggle en el header.
- Glassmorphism (`.tarjeta-cristal`) y botones con gradiente animado
  (`.boton-gradiente`) reutilizados en toda la app nueva.

La navegación ahora tiene 3 pestañas: **Mapa 2D** (Leaflet, V2.0),
**Vista 3D** (Deck.gl, nuevo) y **Biblioteca del Bosque** (nuevo).

---

## 10. Ajustes2.0 — Correcciones de Mapa 3D + Tipografía/Animación

- **Mapa 3D corregido** (`Mapa3DTerreno.jsx`): terreno con textura real de
  OSM (no verde plano), `LightingEffect` (Ambient + Directional) para
  sombras y relieve, columnas de avistamientos en `#FF6B35` con altura
  proporcional, esferas de riesgo con halo/glow apilado, vista inicial
  `lat 19.12 / lng -100.04 / pitch 60 / bearing 0`, `elevationScale: 50`,
  `TextLayer` con fondo oscuro semi-transparente por marcador, rotación
  libre vía `dragRotate`/`touchRotate`, y panel de leyenda ampliado.
- **Tipografía**: Montserrat (títulos 700/900), Poppins (subtítulos 600),
  Inter (cuerpo). Config en `tailwind.config.js` + `index.css`.
- **Animación del Hero**: `HeroTitulo.jsx` (stagger por letra, bounce
  `cubic-bezier(0.34,1.56,0.64,1)`, hover scale+glow, shimmer de
  gradiente), `SubtituloTypewriter.jsx` (efecto máquina de escribir),
  `ParticulasMariposas.jsx` (canvas 2D con mariposas de fondo), botón
  CTA con `animate-pulso` infinito (`ui/ButtonPrimary.jsx`).
- **Design System oficial**: variables CSS (`--monarca-orange`,
  `--gradient-hero`, `--shadow-glow`, etc.) en `:root` de `index.css`,
  más los componentes reutilizables `ui/ButtonPrimary.jsx` y
  `ui/GlassCard.jsx` de la guía de estilo.

## 11. Pilar 3 — Realidad Aumentada "Bosque Aumentado"

Ejecuta `database/05_realidad_aumentada.sql` después de la migración 04.

- **Identificador de Especies con IA** (`ar/IdentificadorAR.jsx`):
  reutiliza el motor TensorFlow.js/MobileNet del Pilar 1, generalizado a
  flora **y fauna** (se agregó la mariposa monarca a `flora_santuario`
  vía la nueva columna `tipo_especie`). Cada identificación exitosa
  registra un hallazgo en la Caza del Tesoro.
- **Puntos de Interés Aumentados** (`ar/PuntosInteresAR.jsx`):
  AR "ligera" con Geolocation API + Device Orientation API (rumbo real
  vs. hacia dónde apunta el teléfono) — la técnica estándar y gratuita
  de "POI AR" al aire libre, sin depender de 8th Wall ni SDKs de pago.
  Datos en `puntos_interes_ar` (Árbol Centenario, Zona de Hibernación,
  Mirador).
- **Caza del Tesoro Digital** (`ar/CazaTesoro.jsx` +
  `routers/realidad_aumentada.py`): progreso por especie encontrada,
  otorga el badge `NATURALISTA_AR` al completar el catálogo.

**Nota honesta:** no se integró Google ML Kit ni 8th Wall (requieren
apps nativas o licencias); se optó por TensorFlow.js + Web APIs
estándar, 100% gratuito y funcional en cualquier navegador móvil moderno.

## 12. Pilar 4 — Alertas Inteligentes "Guardian Push"

Ejecuta `database/06_alertas_guardian_push.sql` después de la migración 05.
Requiere variables de entorno adicionales en `.env` (ver `.env.example`):
`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` (genera con
`npx web-push generate-vapid-keys`) y credenciales de `TWILIO_*`.

- **Push PWA real**: `services/web_push_client.py` (pywebpush + VAPID),
  Service Worker personalizado `frontend/src/sw.js` (estrategia
  `injectManifest` de vite-plugin-pwa) que escucha `push` y
  `notificationclick` aunque la app esté cerrada. El hook
  `useNotificacionesPush.js` + `GuardianPushBanner.jsx` gestionan la
  suscripción desde el header.
- **WhatsApp** (`services/twilio_whatsapp_client.py`) y **SMS de
  emergencia** (`services/twilio_sms_client.py`) vía Twilio, con tablas
  `contactos_whatsapp` / `contactos_sms` para poblar manualmente a los
  ejidatarios (SMS reservado a alertas `critico` por costo).
- **Endpoint del prompt**: `POST /api/v3/alertas/enviar` (mensaje,
  nivel_urgencia, sectores_afectados) implementado en
  `routers/alertas_push.py`, disparando los 3 canales.
- **Automatización real**: `jobs/cron_ingesta.py` ahora llama
  `_disparar_guardian_push()` apenas detecta un riesgo `Crítico` de
  congelación, sin intervención humana.

**Nota honesta:** Web Push y Twilio requieren claves reales para
funcionar en producción (VAPID + cuenta Twilio); en ausencia de ellas,
cada cliente registra un warning y omite el envío sin romper el resto
del sistema (fail-safe explícito en cada `services/*_client.py`).

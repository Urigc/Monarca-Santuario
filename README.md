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

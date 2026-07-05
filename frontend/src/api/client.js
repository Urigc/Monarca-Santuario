import { guardarEnIndexedDB, obtenerDeIndexedDB, limpiarIndexedDB } from "../db/indexedDB";

// En producción: variable de entorno VITE_API_BASE_URL apuntando a Render/Railway
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
  return res.json();
}

// ---- Capas del mapa (Sección 5) ----
export const getSectores = () => apiGet("/api/v2/sectores");
export const getReportesPendientes = () => apiGet("/api/v2/reportes?estado=Pendiente");
export const getAvistamientos = () => apiGet("/api/v2/avistamientos");
export const getMicroclimaActual = () => apiGet("/api/v2/microclima/actual");
export const getNdviActual = () => apiGet("/api/v2/ndvi/actual");
export const getInfraestructura = () => apiGet("/api/v2/infraestructura");
export const getAlertas = () => apiGet("/api/v2/alertas");
export const getSiniestros = () => apiGet("/api/v2/siniestros");
export const getBrechasCortafuego = () => apiGet("/api/v2/siniestros/brechas-cortafuego");
export const getAuditoriaForestal = () => apiGet("/api/v2/siniestros/auditoria-forestal");

// ---- Biblioteca del Bosque (Pilar 1, sin quizzes) ----
export const getContenidosEducativos = (nivel) =>
  apiGet(`/api/v2/educacion/contenidos${nivel ? `?nivel=${nivel}` : ""}`);
export const getFloraSantuario = () => apiGet("/api/v2/educacion/flora");
export const getBadgesUsuario = (usuarioId) => apiGet(`/api/v2/educacion/badges/${usuarioId}`);

export async function registrarProgresoContenido(usuarioIdentificador, idContenido) {
  const res = await fetch(`${API_BASE_URL}/api/v2/educacion/progreso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario_identificador: usuarioIdentificador, id_contenido: idContenido }),
  });
  if (!res.ok) throw new Error(`Error al registrar progreso: ${res.status}`);
  return res.json();
}

// ---- Pilar 3: Realidad Aumentada "Bosque Aumentado" ----
export const getPuntosInteresAR = () => apiGet("/api/v3/ar/puntos-interes");
export const getEspeciesAR = (tipoEspecie) =>
  apiGet(`/api/v3/ar/especies${tipoEspecie ? `?tipo_especie=${tipoEspecie}` : ""}`);
export const getProgresoCazaTesoro = (usuarioId) =>
  apiGet(`/api/v3/ar/caza-tesoro/progreso/${usuarioId}`);

export async function registrarHallazgoAR(usuarioIdentificador, idFlora, coords) {
  const res = await fetch(`${API_BASE_URL}/api/v3/ar/caza-tesoro/hallazgo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_identificador: usuarioIdentificador,
      id_flora: idFlora,
      latitud_hallazgo: coords?.latitud,
      longitud_hallazgo: coords?.longitud,
    }),
  });
  if (!res.ok) throw new Error(`Error al registrar hallazgo: ${res.status}`);
  return res.json();
}

// ---- Módulo de Analítica (Sección 6) ----
export const getInsights = () => apiGet("/api/v2/analitica/insights");
export const getMuestreoLineal = (idSector) => apiGet(`/api/v2/analitica/muestreo-lineal?id_sector=${idSector}`);

// ---- Votación cruzada ejidal (Sección 6 y 9.3.3) ----
export async function votarReporte(idReporte, voto) {
  const res = await fetch(`${API_BASE_URL}/api/v2/reportes/${idReporte}/votar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voto),
  });
  if (!res.ok) throw new Error(`Error al votar: ${res.status}`);
  return res.json();
}

/**
 * Registro de un reporte comunitario (Sección 6 y 10):
 * Offline-First -> IndexedDB local si no hay red; sincronización directa si la hay.
 */
export async function registrarReporteComunitario(reporte) {
  if (!navigator.onLine) {
    await guardarEnIndexedDB(reporte);
    return { almacenadoLocalmente: true };
  }
  try {
    const respuesta = await fetch(`${API_BASE_URL}/api/v2/reportes/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([reporte]),
    });
    if (!respuesta.ok) throw new Error("Fallo del servidor");
    return { almacenadoLocalmente: false, data: await respuesta.json() };
  } catch (error) {
    await guardarEnIndexedDB(reporte);
    return { almacenadoLocalmente: true, error };
  }
}

/** Vacía la cola de IndexedDB hacia Supabase cuando vuelve la señal (evento 'online'). */
export async function sincronizarReportesPendientes() {
  const pendientes = await obtenerDeIndexedDB();
  if (pendientes.length === 0) return { sincronizados: 0 };

  const respuesta = await fetch(`${API_BASE_URL}/api/v2/reportes/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pendientes.map(({ local_id, ...resto }) => resto)),
  });

  if (respuesta.ok) {
    await limpiarIndexedDB();
    return { sincronizados: pendientes.length };
  }
  throw new Error("No se pudo sincronizar el lote pendiente.");
}

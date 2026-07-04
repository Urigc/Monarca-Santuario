import { openDB } from "idb";

const DB_NAME = "santuario_digital_db";
const DB_VERSION = 1;
const STORE = "reportes_pendientes";

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "local_id", autoIncrement: true });
      }
    },
  });
}

/** Guarda un reporte capturado en campo sin conectividad. */
export async function guardarEnIndexedDB(reporte) {
  const db = await getDB();
  await db.add(STORE, { ...reporte, fecha_creacion: reporte.fecha_creacion || new Date().toISOString() });
}

/** Devuelve todos los reportes pendientes de sincronizar. */
export async function obtenerDeIndexedDB() {
  const db = await getDB();
  return db.getAll(STORE);
}

/** Limpia la cola local tras una sincronización exitosa. */
export async function limpiarIndexedDB() {
  const db = await getDB();
  await db.clear(STORE);
}

/** Cuenta cuántos reportes esperan sincronización (para el indicador de UI). */
export async function contarPendientes() {
  const db = await getDB();
  return db.count(STORE);
}

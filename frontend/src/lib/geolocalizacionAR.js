/**
 * AR "ligera" basada en Geolocation API + Device Orientation API
 * (sin SDK de pago tipo 8th Wall): calculamos distancia y rumbo real
 * hacia cada punto de interés y lo comparamos contra hacia dónde
 * apunta el teléfono para decidir si el marcador debe verse en pantalla.
 */

const RADIO_TIERRA_KM = 6371;

export function distanciaHaversineMetros(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIO_TIERRA_KM * c * 1000;
}

/** Rumbo (bearing) en grados [0-360) desde (lat1,lng1) hacia (lat2,lng2). */
export function calcularRumbo(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Diferencia angular más corta entre dos rumbos, en [-180, 180]. */
export function diferenciaAngular(a, b) {
  let diff = (b - a + 540) % 360 - 180;
  return diff;
}

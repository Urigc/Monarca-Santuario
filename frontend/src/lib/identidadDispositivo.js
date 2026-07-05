const CLAVE = "santuario_device_id";

/**
 * Genera (una sola vez) y persiste un identificador anónimo de
 * dispositivo, usado para asociar progreso educativo y badges sin
 * requerir un sistema de cuentas completo todavía.
 */
export function obtenerIdentificadorDispositivo() {
  let id = localStorage.getItem(CLAVE);
  if (!id) {
    id = "dispositivo-" + crypto.randomUUID();
    localStorage.setItem(CLAVE, id);
  }
  return id;
}

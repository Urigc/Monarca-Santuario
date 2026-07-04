import { useEffect, useState } from "react";
import { sincronizarReportesPendientes } from "../api/client";
import { contarPendientes } from "../db/indexedDB";

/**
 * Escucha los eventos nativos online/offline del navegador (Sección 10)
 * y dispara la sincronización masiva de IndexedDB -> Supabase apenas
 * el ejidatario recupera señal al bajar al pueblo.
 */
export function useOnlineStatus() {
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    const actualizarConteo = () => contarPendientes().then(setPendientes);
    actualizarConteo();

    const handleOnline = async () => {
      setEnLinea(true);
      setSincronizando(true);
      try {
        await sincronizarReportesPendientes();
      } catch (e) {
        console.warn("Sincronización diferida:", e);
      } finally {
        setSincronizando(false);
        actualizarConteo();
      }
    };
    const handleOffline = () => setEnLinea(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { enLinea, pendientes, sincronizando };
}

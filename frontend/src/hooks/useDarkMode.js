import { useEffect, useState } from "react";

const CLAVE_STORAGE = "santuario_tema_preferido";

/**
 * Pilar 2 (ANEXO1): "Dark Mode Automático: Detecta preferencia del sistema".
 * Respeta prefers-color-scheme por defecto, pero permite override manual
 * persistente (guardado en localStorage del propio dispositivo del usuario,
 * no de un artifact de chat).
 */
export function useDarkMode() {
  const [modoOscuro, setModoOscuro] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado) return guardado === "oscuro";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", modoOscuro);
  }, [modoOscuro]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem(CLAVE_STORAGE)) setModoOscuro(e.matches);
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const alternar = () => {
    setModoOscuro((prev) => {
      const nuevo = !prev;
      localStorage.setItem(CLAVE_STORAGE, nuevo ? "oscuro" : "claro");
      return nuevo;
    });
  };

  return { modoOscuro, alternar };
}

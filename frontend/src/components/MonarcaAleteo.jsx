import React, { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

let idGlobal = 0;

/**
 * Pilar 2 (ANEXO1): "Al hacer click en un marcador del mapa: Animación
 * de aleteo (SVG de mariposa que vuela)".
 * Se monta una sola vez sobre el mapa; expone `disparar(x, y)` a través
 * de un ref para que cualquier capa Leaflet la invoque en su onClick.
 */
export function useAleteoController() {
  const [mariposas, setMariposas] = useState([]);

  const disparar = useCallback((x, y) => {
    const id = ++idGlobal;
    setMariposas((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setMariposas((prev) => prev.filter((m) => m.id !== id));
    }, 900);
  }, []);

  const overlay = (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
      <AnimatePresence>
        {mariposas.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 1, scale: 0.6, x: m.x, y: m.y }}
            animate={{ opacity: 0, scale: 1.4, y: m.y - 60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ position: "absolute", fontSize: "2rem" }}
          >
            <span className="aleteo-mariposa">🦋</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return { disparar, overlay };
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CicloVidaAnimado from "./CicloVidaAnimado.jsx";
import GaleriaFlora from "./GaleriaFlora.jsx";
import VideoReels from "./VideoReels.jsx";
import RutaAprendizaje from "./RutaAprendizaje.jsx";
import { registrarProgresoContenido } from "../../api/client.js";
import { obtenerIdentificadorDispositivo } from "../../lib/identidadDispositivo.js";

/** Envuelve cada sección con scroll suave/fade-in (Pilar 2: react-intersection-observer). */
function SeccionAnimada({ children }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="seccion-biblioteca"
    >
      {children}
    </motion.section>
  );
}

/**
 * Pilar 1 (ANEXO1): "Centro de Educación Inmersiva 'Biblioteca del
 * Bosque'". Ensambla enciclopedia multimedia + ruta de aprendizaje
 * gamificada, integrado con la API de /api/v2/educacion del backend.
 */
export default function BibliotecaDelBosque() {
  const [badgesRecienDesbloqueados, setBadgesRecienDesbloqueados] = useState([]);
  const idDispositivo = obtenerIdentificadorDispositivo();

  const marcarCicloVidaCompleto = async () => {
    // El artículo "Ciclo de Vida" es id_contenido 1 en el seed (04_educacion_gamificacion.sql)
    try {
      const { nuevos_badges } = await registrarProgresoContenido(idDispositivo, 1);
      if (nuevos_badges?.length) setBadgesRecienDesbloqueados(nuevos_badges);
    } catch (e) {
      console.warn("No se pudo registrar el ciclo de vida:", e);
    }
  };

  return (
    <div className="biblioteca-bosque">
      <SeccionAnimada>
        <CicloVidaAnimado onEtapaCompleta={marcarCicloVidaCompleto} />
      </SeccionAnimada>

      <SeccionAnimada>
        <VideoReels onVisto={setBadgesRecienDesbloqueados} />
      </SeccionAnimada>

      <SeccionAnimada>
        <GaleriaFlora />
      </SeccionAnimada>

      <SeccionAnimada>
        <RutaAprendizaje badgesRecienDesbloqueados={badgesRecienDesbloqueados} />
      </SeccionAnimada>
    </div>
  );
}

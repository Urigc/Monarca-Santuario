import React, { useEffect, useState } from "react";
import { getProgresoCazaTesoro } from "../../api/client.js";
import { obtenerIdentificadorDispositivo } from "../../lib/identidadDispositivo.js";

/** Pilar 3 (ANEXO1) — "Caza del Tesoro Digital: encuentra 5 especies de flora nativa". */
export default function CazaTesoro() {
  const [progreso, setProgreso] = useState(null);
  const idDispositivo = obtenerIdentificadorDispositivo();

  useEffect(() => {
    getProgresoCazaTesoro(idDispositivo).then(setProgreso).catch((e) => console.warn("Caza tesoro:", e));
  }, [idDispositivo]);

  if (!progreso) return null;

  const porcentaje = progreso.total_especies
    ? Math.round((progreso.encontradas / progreso.total_especies) * 100)
    : 0;

  return (
    <div className="caza-tesoro tarjeta-cristal">
      <h4 className="font-subtitulo">🗺️ Caza del Tesoro Digital</h4>
      <p>{progreso.encontradas} de {progreso.total_especies} especies identificadas</p>
      <div className="barra-progreso">
        <div className="barra-progreso-relleno" style={{ width: `${porcentaje}%` }} />
      </div>
      <ul className="lista-especies-tesoro">
        {progreso.especies.map((e) => (
          <li key={e.id_flora} className={e.encontrada ? "encontrada" : ""}>
            {e.encontrada ? "✅" : "🔒"} {e.nombre_comun}
          </li>
        ))}
      </ul>
    </div>
  );
}

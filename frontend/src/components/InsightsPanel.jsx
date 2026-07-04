import React, { useEffect, useState } from "react";
import { getInsights } from "../api/client.js";

/**
 * Motor de Conclusiones Automatizadas (Sección 6): muestra las
 * narrativas heurísticas generadas semanalmente por el backend.
 */
export default function InsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch((e) => console.warn("No se pudo cargar insights:", e))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section>
      <h3>🔍 Motor de Conclusiones</h3>
      {cargando && <p style={{ fontSize: "0.85rem" }}>Cargando…</p>}
      {!cargando && insights.length === 0 && (
        <p style={{ fontSize: "0.85rem", color: "#666" }}>
          Sin alertas de desviación de hábitat esta semana.
        </p>
      )}
      {insights.map((i) => (
        <div key={i.id_conclusion} className={`insight-card urgencia-${i.nivel_urgencia}`}>
          <strong>{i.sector}</strong> · {i.nivel_urgencia}
          <p style={{ margin: "0.3rem 0 0" }}>{i.narrativa_insights}</p>
        </div>
      ))}
    </section>
  );
}

import React, { useState, useEffect } from "react";
import MapDashboard from "./components/MapDashboard.jsx";
import InsightsPanel from "./components/InsightsPanel.jsx";
import ReporteForm from "./components/ReporteForm.jsx";
import VotacionPanel from "./components/VotacionPanel.jsx";
import { useOnlineStatus } from "./hooks/useOnlineStatus.js";
import { getReportesPendientes } from "./api/client.js";

const CAPAS_INICIALES = {
  zonificacion: true,
  avistamientos: true,
  microclima: true,
  ndvi: false,
  infraestructura: false,
  auditoria: false,
  siniestros: false,
};

export default function App() {
  const [capasActivas, setCapasActivas] = useState(CAPAS_INICIALES);
  const { enLinea, pendientes, sincronizando } = useOnlineStatus();
  const [reportesPendientes, setReportesPendientes] = useState([]);

  useEffect(() => {
    getReportesPendientes()
      .then(setReportesPendientes)
      .catch((e) => console.warn("No se pudo cargar reportes pendientes:", e));
  }, []);

  const retirarReporteVotado = (idReporte, resultado) => {
    if (resultado.estado_actual_reporte !== "Pendiente") {
      setReportesPendientes((prev) => prev.filter((r) => r.id_reporte !== idReporte));
    }
  };

  const toggleCapa = (clave) =>
    setCapasActivas((prev) => ({ ...prev, [clave]: !prev[clave] }));

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>🦋 Santuario Digital Temascaltepec — Piedra Herrada</h1>
        <span className={`estado-conexion ${enLinea ? "en-linea" : "fuera-linea"}`}>
          {enLinea ? (sincronizando ? "Sincronizando…" : "En línea") : "Sin conexión"}
          {pendientes > 0 ? ` · ${pendientes} reportes pendientes` : ""}
        </span>
      </header>

      <div className="dashboard-body">
        <aside className="panel-capas">
          <h3>Capas Territoriales</h3>
          <PanelCapas capasActivas={capasActivas} toggleCapa={toggleCapa} />
        </aside>

        <main className="mapa-contenedor">
          <MapDashboard capasActivas={capasActivas} />
        </main>

        <aside className="panel-lateral">
          <InsightsPanel />
          <hr />
          <ReporteForm />
          <hr />
          <VotacionPanel
            reportesPendientes={reportesPendientes}
            onVotoRegistrado={retirarReporteVotado}
          />
        </aside>
      </div>
    </div>
  );
}

function PanelCapas({ capasActivas, toggleCapa }) {
  const capas = [
    { clave: "zonificacion", label: "1. Delimitación Poligonal" },
    { clave: "avistamientos", label: "2. Mapa de Calor de Avistamientos" },
    { clave: "microclima", label: "3. Semáforo de Riesgo Microclimático" },
    { clave: "ndvi", label: "4. Salud Forestal (NDVI)" },
    { clave: "infraestructura", label: "5. Infraestructura Turística" },
    { clave: "auditoria", label: "6. Auditoría Forestal Comunitaria" },
    { clave: "siniestros", label: "7. Siniestros e Incendios" },
  ];
  return (
    <div>
      {capas.map((c) => (
        <label key={c.clave} className="capa-toggle">
          <input
            type="checkbox"
            checked={capasActivas[c.clave]}
            onChange={() => toggleCapa(c.clave)}
          />
          {c.label}
        </label>
      ))}
      <div className="semaforo-leyenda">
        <span><span className="punto-verde" />Óptimo</span>
        <span><span className="punto-naranja" />Precaución</span>
        <span><span className="punto-rojo" />Crítico</span>
      </div>
    </div>
  );
}

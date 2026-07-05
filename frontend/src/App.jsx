import React, { useState, useEffect } from "react";
import HeroSection from "./components/HeroSection.jsx";
import MapDashboard from "./components/MapDashboard.jsx";
import Mapa3DTerreno from "./components/Mapa3DTerreno.jsx";
import BibliotecaDelBosque from "./components/biblioteca/BibliotecaDelBosque.jsx";
import BosqueAumentado from "./components/ar/BosqueAumentado.jsx";
import InsightsPanel from "./components/InsightsPanel.jsx";
import ReporteForm from "./components/ReporteForm.jsx";
import VotacionPanel from "./components/VotacionPanel.jsx";
import DarkModeToggle from "./components/DarkModeToggle.jsx";
import GuardianPushBanner from "./components/GuardianPushBanner.jsx";
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

const VISTAS = {
  MAPA_2D: "mapa_2d",
  MAPA_3D: "mapa_3d",
  BIBLIOTECA: "biblioteca",
  BOSQUE_AUMENTADO: "bosque_aumentado",
};

export default function App() {
  const [mostrarHero, setMostrarHero] = useState(true);
  const [vistaActiva, setVistaActiva] = useState(VISTAS.MAPA_2D);
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

  if (mostrarHero) {
    return <HeroSection onExplorar={() => setMostrarHero(false)} />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="font-titulo">🦋 Santuario Digital Temascaltepec — Piedra Herrada</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className={`estado-conexion ${enLinea ? "en-linea" : "fuera-linea"}`}>
            {enLinea ? (sincronizando ? "Sincronizando…" : "En línea") : "Sin conexión"}
            {pendientes > 0 ? ` · ${pendientes} reportes pendientes` : ""}
          </span>
          <GuardianPushBanner />
          <DarkModeToggle />
        </div>
      </header>

      <nav className="tabs-navegacion">
        <button
          className={`tab-boton ${vistaActiva === VISTAS.MAPA_2D ? "activo" : ""}`}
          onClick={() => setVistaActiva(VISTAS.MAPA_2D)}
        >
          🗺️ Mapa 2D
        </button>
        <button
          className={`tab-boton ${vistaActiva === VISTAS.MAPA_3D ? "activo" : ""}`}
          onClick={() => setVistaActiva(VISTAS.MAPA_3D)}
        >
          ⛰️ Vista 3D del Terreno
        </button>
        <button
          className={`tab-boton ${vistaActiva === VISTAS.BIBLIOTECA ? "activo" : ""}`}
          onClick={() => setVistaActiva(VISTAS.BIBLIOTECA)}
        >
          📚 Biblioteca del Bosque
        </button>
        <button
          className={`tab-boton ${vistaActiva === VISTAS.BOSQUE_AUMENTADO ? "activo" : ""}`}
          onClick={() => setVistaActiva(VISTAS.BOSQUE_AUMENTADO)}
        >
          🔭 Bosque Aumentado
        </button>
      </nav>

      {vistaActiva === VISTAS.BIBLIOTECA && (
        <div style={{ overflowY: "auto", flex: 1 }}>
          <BibliotecaDelBosque />
        </div>
      )}

      {vistaActiva === VISTAS.BOSQUE_AUMENTADO && (
        <div style={{ overflowY: "auto", flex: 1 }}>
          <BosqueAumentado />
        </div>
      )}

      {(vistaActiva === VISTAS.MAPA_2D || vistaActiva === VISTAS.MAPA_3D) && (
        <div className="dashboard-body">
          <aside className="panel-capas">
            <h3>Capas Territoriales</h3>
            <PanelCapas capasActivas={capasActivas} toggleCapa={toggleCapa} />
          </aside>

          <main className="mapa-contenedor">
            {vistaActiva === VISTAS.MAPA_2D ? (
              <MapDashboard capasActivas={capasActivas} />
            ) : (
              <Mapa3DTerreno />
            )}
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
      )}
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

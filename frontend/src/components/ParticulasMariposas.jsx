import React, { useEffect, useRef } from "react";

/**
 * Ajustes2.0 — "Background particles de mariposas volando (canvas
 * animation)". Implementación ligera en canvas 2D (sin librerías
 * extra): cada partícula es un emoji 🦋 que se mueve en una
 * trayectoria senoidal ascendente, con aleteo simulado al escalar
 * horizontalmente el glyph.
 */
export default function ParticulasMariposas({ cantidad = 14 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let ancho = (canvas.width = canvas.offsetWidth);
    let alto = (canvas.height = canvas.offsetHeight);

    const mariposas = Array.from({ length: cantidad }, () => ({
      x: Math.random() * ancho,
      y: alto + Math.random() * alto,
      velocidad: 0.4 + Math.random() * 0.8,
      amplitud: 20 + Math.random() * 40,
      fase: Math.random() * Math.PI * 2,
      tamano: 14 + Math.random() * 16,
      aleteoFase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      ancho = canvas.width = canvas.offsetWidth;
      alto = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);

    function dibujar() {
      ctx.clearRect(0, 0, ancho, alto);
      for (const m of mariposas) {
        m.y -= m.velocidad;
        m.fase += 0.02;
        m.aleteoFase += 0.25;
        if (m.y < -30) {
          m.y = alto + 30;
          m.x = Math.random() * ancho;
        }
        const x = m.x + Math.sin(m.fase) * m.amplitud;
        const escalaAleteo = 0.7 + Math.abs(Math.sin(m.aleteoFase)) * 0.5;

        ctx.save();
        ctx.translate(x, m.y);
        ctx.scale(escalaAleteo, 1);
        ctx.font = `${m.tamano}px serif`;
        ctx.globalAlpha = 0.55;
        ctx.fillText("🦋", 0, 0);
        ctx.restore();
      }
      animId = requestAnimationFrame(dibujar);
    }
    dibujar();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [cantidad]);

  return <canvas ref={canvasRef} className="particulas-mariposas-canvas" />;
}

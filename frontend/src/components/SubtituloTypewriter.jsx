import React, { useEffect, useState } from "react";

/** Ajustes2.0 — "Subtítulo con typewriter effect (aparece letra por letra)". */
export default function SubtituloTypewriter({ texto, velocidadMs = 28, delayInicialMs = 1600 }) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    let indice = 0;
    let intervalo;
    const inicio = setTimeout(() => {
      intervalo = setInterval(() => {
        indice += 1;
        setVisible(texto.slice(0, indice));
        if (indice >= texto.length) clearInterval(intervalo);
      }, velocidadMs);
    }, delayInicialMs);

    return () => {
      clearTimeout(inicio);
      clearInterval(intervalo);
    };
  }, [texto, velocidadMs, delayInicialMs]);

  return (
    <p className="hero-subtitulo font-cuerpo">
      {visible}
      <span className="typewriter-cursor">|</span>
    </p>
  );
}

import React, { useEffect, useState } from "react";
import { getBadgesUsuario } from "../../api/client.js";
import { obtenerIdentificadorDispositivo } from "../../lib/identidadDispositivo.js";
import { celebrarLogro } from "../../lib/confetti.js";
import BadgeCard from "./BadgeCard.jsx";

/**
 * Pilar 1 (ANEXO1): "Módulo 'Guardián Novato' → 'Protector Experto' →
 * 'Embajador Monarca'". Por decisión explícita del cliente, el
 * progreso se basa en exploración de contenidos (videos/artículos/
 * galerías), NO en quizzes.
 */
export default function RutaAprendizaje({ badgesRecienDesbloqueados }) {
  const [badges, setBadges] = useState([]);
  const idDispositivo = obtenerIdentificadorDispositivo();

  const cargarBadges = () => {
    getBadgesUsuario(idDispositivo).then(setBadges).catch((e) => console.warn("Badges:", e));
  };

  useEffect(cargarBadges, []);

  useEffect(() => {
    if (badgesRecienDesbloqueados?.length) {
      celebrarLogro();
      cargarBadges();
    }
  }, [badgesRecienDesbloqueados]);

  const totalObtenidos = badges.filter((b) => b.obtenido).length;

  return (
    <div className="ruta-aprendizaje">
      <h3 className="font-titulo">🏅 Ruta de Aprendizaje</h3>
      <p className="texto-secundario">
        {totalObtenidos} de {badges.length} insignias obtenidas explorando la Biblioteca del Bosque.
      </p>
      <div className="grilla-badges">
        {badges.map((b) => (
          <BadgeCard key={b.id_badge} badge={b} />
        ))}
      </div>
    </div>
  );
}

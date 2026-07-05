import React from "react";
import IdentificadorAR from "./IdentificadorAR.jsx";
import PuntosInteresAR from "./PuntosInteresAR.jsx";
import CazaTesoro from "./CazaTesoro.jsx";

/** Pilar 3 (ANEXO1): "Realidad Aumentada 'Bosque Aumentado'". */
export default function BosqueAumentado() {
  return (
    <div className="bosque-aumentado">
      <div className="bosque-aumentado-columna">
        <IdentificadorAR />
        <hr />
        <PuntosInteresAR />
      </div>
      <div className="bosque-aumentado-lateral">
        <CazaTesoro />
      </div>
    </div>
  );
}

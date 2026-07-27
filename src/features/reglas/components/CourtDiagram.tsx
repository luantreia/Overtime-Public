import React from 'react';

/**
 * Diagrama simple de la cancha de dodgeball con sus medidas reales (18m x 9m,
 * dos mitades de 9m x 9m) y las "colas" de espera de cada equipo.
 */
export const CourtDiagram: React.FC = () => {
  return (
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto" role="img" aria-label="Diagrama de la cancha de dodgeball, 18 por 9 metros, dividida en dos mitades de 9 por 9">
      {/* Cola equipo local */}
      <rect x="10" y="60" width="28" height="100" rx="6" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="24" y="115" textAnchor="middle" fontSize="9" fontWeight="700" fill="#b91c1c" transform="rotate(-90 24 115)">COLA</text>

      {/* Cancha */}
      <rect x="48" y="40" width="264" height="140" rx="10" fill="#eef2ff" stroke="#6366f1" strokeWidth="2" />
      {/* Mitad izquierda (rojo) */}
      <rect x="48" y="40" width="132" height="140" rx="10" fill="#fee2e2" fillOpacity="0.5" />
      {/* Mitad derecha (azul) */}
      <rect x="180" y="40" width="132" height="140" rx="10" fill="#dbeafe" fillOpacity="0.5" />
      {/* Línea central */}
      <line x1="180" y1="40" x2="180" y2="180" stroke="#4338ca" strokeWidth="2.5" />

      {/* Etiquetas de equipo */}
      <text x="114" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill="#b91c1c">EQUIPO ROJO</text>
      <text x="246" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1d4ed8">EQUIPO AZUL</text>

      {/* Medida 9x9 mitad izquierda */}
      <text x="114" y="115" textAnchor="middle" fontSize="10" fill="#7f1d1d" fontWeight="700">9m x 9m</text>
      {/* Medida 9x9 mitad derecha */}
      <text x="246" y="115" textAnchor="middle" fontSize="10" fill="#1e3a8a" fontWeight="700">9m x 9m</text>

      {/* Cota total 18m (abajo) */}
      <line x1="48" y1="196" x2="312" y2="196" stroke="#64748b" strokeWidth="1" />
      <line x1="48" y1="191" x2="48" y2="201" stroke="#64748b" strokeWidth="1" />
      <line x1="312" y1="191" x2="312" y2="201" stroke="#64748b" strokeWidth="1" />
      <text x="180" y="212" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">18 metros</text>

      {/* Cota 9m (izquierda, vertical) */}
      <line x1="30" y1="40" x2="30" y2="180" stroke="#64748b" strokeWidth="1" />
      <line x1="25" y1="40" x2="35" y2="40" stroke="#64748b" strokeWidth="1" />
      <line x1="25" y1="180" x2="35" y2="180" stroke="#64748b" strokeWidth="1" />
      <text x="30" y="112" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569" transform="rotate(-90 16 112)">9 metros</text>

      {/* Cola equipo visitante */}
      <rect x="322" y="60" width="28" height="100" rx="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="336" y="115" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1d4ed8" transform="rotate(-90 336 115)">COLA</text>
    </svg>
  );
};

export default CourtDiagram;

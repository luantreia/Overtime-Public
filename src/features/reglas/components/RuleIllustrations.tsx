import React from 'react';

const Player: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g>
    <circle cx={x} cy={y} r="10" fill={color} />
    <circle cx={x} cy={y - 3} r="3.2" fill="white" fillOpacity="0.9" />
  </g>
);

/** La "arrancada": ambos equipos corriendo hacia las pelotas en la línea central. */
export const IlustracionArrancada: React.FC = () => (
  <svg viewBox="0 0 260 120" className="w-full max-w-xs mx-auto" role="img" aria-label="Ilustración de la arrancada: jugadores corriendo hacia el centro de la cancha">
    <line x1="130" y1="10" x2="130" y2="110" stroke="#c7d2fe" strokeWidth="3" />
    {/* Pelotas en el centro */}
    {[-24, -8, 8, 24].map((dy, i) => (
      <circle key={i} cx="130" cy={60 + dy} r="6" fill="#f59e0b" />
    ))}
    {/* Jugadores rojos corriendo desde la izquierda */}
    <Player x={30} y={30} color="#ef4444" />
    <Player x={40} y={70} color="#ef4444" />
    <Player x={25} y={100} color="#ef4444" />
    {/* Flechas de movimiento */}
    <path d="M45 30 L85 30" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
    <path d="M55 70 L95 70" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
    {/* Jugadores azules corriendo desde la derecha */}
    <Player x={230} y={30} color="#3b82f6" />
    <Player x={220} y={70} color="#3b82f6" />
    <Player x={235} y={100} color="#3b82f6" />
    <path d="M215 30 L175 30" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowBlue)" />
    <path d="M205 70 L165 70" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowBlue)" />
    <defs>
      <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" /></marker>
      <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#3b82f6" /></marker>
    </defs>
  </svg>
);

/** Eliminación directa vs. bloqueo con otra pelota. */
export const IlustracionEliminacion: React.FC = () => (
  <svg viewBox="0 0 260 110" className="w-full max-w-xs mx-auto" role="img" aria-label="Ilustración de un tiro que elimina a un jugador que no logra bloquear">
    <Player x={40} y={55} color="#3b82f6" />
    <circle cx="90" cy="55" r="7" fill="#f59e0b" />
    <path d="M50 55 L130 55" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrowBall)" />
    <g opacity="0.85">
      <circle cx={200} cy={55} r="10" fill="#ef4444" />
      <path d="M193 48 L207 62 M207 48 L193 62" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
    <text x="200" y="90" textAnchor="middle" fontSize="9" fontWeight="700" fill="#b91c1c">¡Eliminado!</text>
    <defs>
      <marker id="arrowBall" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" /></marker>
    </defs>
  </svg>
);

/** Atajar la pelota devuelve a un compañero de la cola. */
export const IlustracionAtajarYVolver: React.FC = () => (
  <svg viewBox="0 0 260 120" className="w-full max-w-xs mx-auto" role="img" aria-label="Ilustración de un jugador atajando la pelota, lo que hace volver a un compañero eliminado">
    <Player x={40} y={45} color="#ef4444" />
    <circle cx="90" cy="45" r="7" fill="#f59e0b" />
    <path d="M50 45 L120 45" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrowCatch)" />
    <g>
      <circle cx={140} cy={45} r="11" fill="#3b82f6" />
      <path d="M132 39 Q140 32 148 39" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
    <text x="140" y="70" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1d4ed8">¡Atajada!</text>

    {/* Compañero volviendo desde la cola */}
    <circle cx={210} cy={95} r="9" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M198 90 Q170 70 155 55" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowBack)" />
    <text x="215" y="112" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1d4ed8">vuelve a jugar</text>
    <defs>
      <marker id="arrowCatch" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" /></marker>
      <marker id="arrowBack" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#3b82f6" /></marker>
    </defs>
  </svg>
);

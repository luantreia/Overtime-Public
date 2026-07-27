import React from 'react';

export type CourtMode = 'inicio' | 'cancha' | 'equipos' | 'apertura' | 'eliminado' | 'volver' | 'gana' | 'limpio';

interface CourtDiagramProps {
  mode: CourtMode;
  /** Solo relevante en modo 'apertura': cuántas pelotas hay y cómo se reparten. */
  formato?: 'foam' | 'cloth';
}

// Geometría base compartida por todos los modos.
const X0 = 60, X1 = 320, Y0 = 70, Y1 = 210, MID = 190;

const CourtBase: React.FC = () => (
  <>
    <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
    <rect x={X0} y={Y0} width={MID - X0} height={Y1 - Y0} rx="10" fill="#fee2e2" fillOpacity="0.5" />
    <rect x={MID} y={Y0} width={X1 - MID} height={Y1 - Y0} rx="10" fill="#dbeafe" fillOpacity="0.5" />
    <line x1={MID} y1={Y0} x2={MID} y2={Y1} stroke="#4338ca" strokeWidth="2.5" />
    <text x={(X0 + MID) / 2} y={Y0 - 12} textAnchor="middle" fontSize="11" fontWeight="800" fill="#b91c1c">EQUIPO ROJO</text>
    <text x={(MID + X1) / 2} y={Y0 - 12} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1d4ed8">EQUIPO AZUL</text>
  </>
);

const ColaBoxes: React.FC = () => (
  <>
    <rect x="18" y={Y0 + 20} width="28" height={Y1 - Y0 - 40} rx="6" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="4 3" />
    <text x="32" y={(Y0 + Y1) / 2} textAnchor="middle" fontSize="9" fontWeight="700" fill="#b91c1c" transform={`rotate(-90 32 ${(Y0 + Y1) / 2})`}>COLA</text>
    <rect x="334" y={Y0 + 20} width="28" height={Y1 - Y0 - 40} rx="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" />
    <text x="348" y={(Y0 + Y1) / 2} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1d4ed8" transform={`rotate(-90 348 ${(Y0 + Y1) / 2})`}>COLA</text>
  </>
);

const MedidasOverlay: React.FC = () => (
  <>
    <line x1={X0} y1={Y1 + 16} x2={X1} y2={Y1 + 16} stroke="#64748b" strokeWidth="1" />
    <line x1={X0} y1={Y1 + 11} x2={X0} y2={Y1 + 21} stroke="#64748b" strokeWidth="1" />
    <line x1={X1} y1={Y1 + 11} x2={X1} y2={Y1 + 21} stroke="#64748b" strokeWidth="1" />
    <text x={MID} y={Y1 + 32} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">18 metros</text>

    <line x1={X0 - 14} y1={Y0} x2={X0 - 14} y2={Y1} stroke="#64748b" strokeWidth="1" />
    <line x1={X0 - 19} y1={Y0} x2={X0 - 9} y2={Y0} stroke="#64748b" strokeWidth="1" />
    <line x1={X0 - 19} y1={Y1} x2={X0 - 9} y2={Y1} stroke="#64748b" strokeWidth="1" />
    <text x={X0 - 14} y={(Y0 + Y1) / 2} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569" transform={`rotate(-90 ${X0 - 28} ${(Y0 + Y1) / 2})`}>9 metros</text>

    <text x={(X0 + MID) / 2} y={(Y0 + Y1) / 2} textAnchor="middle" fontSize="10" fill="#7f1d1d" fontWeight="700">9m x 9m</text>
    <text x={(MID + X1) / 2} y={(Y0 + Y1) / 2} textAnchor="middle" fontSize="10" fill="#1e3a8a" fontWeight="700">9m x 9m</text>
  </>
);

const EquiposOverlay: React.FC = () => {
  const rowsRed = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: X0 + 22,
    y: Y0 + 16 + i * ((Y1 - Y0 - 32) / 5),
  }));
  const rowsBlue = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: X1 - 22,
    y: Y0 + 16 + i * ((Y1 - Y0 - 32) / 5),
  }));
  return (
    <>
      {rowsRed.map((p, i) => (
        <text key={`r${i}`} x={p.x} y={p.y} textAnchor="middle" fontSize="14">🙋‍♂️</text>
      ))}
      {rowsBlue.map((p, i) => (
        <text key={`b${i}`} x={p.x} y={p.y} textAnchor="middle" fontSize="14">🙋‍♀️</text>
      ))}
      {/* Shaggers: agrupados afuera, junto a la línea de fondo de cada equipo */}
      <text x="32" y={Y0 + 8} textAnchor="middle" fontSize="12">🏃</text>
      <text x="32" y={(Y0 + Y1) / 2} textAnchor="middle" fontSize="12">🏃</text>
      <text x="32" y={Y1 - 4} textAnchor="middle" fontSize="12">🏃</text>
      <text x="348" y={Y0 + 8} textAnchor="middle" fontSize="12">🏃</text>
      <text x="348" y={(Y0 + Y1) / 2} textAnchor="middle" fontSize="12">🏃</text>
      <text x="348" y={Y1 - 4} textAnchor="middle" fontSize="12">🏃</text>
      <text x="190" y={Y1 + 32} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
        6 jugadores en cancha por equipo · 3 shaggers afuera, cubriendo cada lado
      </text>
    </>
  );
};

const AperturaOverlay: React.FC<{ formato: 'foam' | 'cloth' }> = ({ formato }) => {
  const total = formato === 'foam' ? 6 : 5;
  const spacing = (Y1 - Y0 - 20) / (total - 1);
  const balls = Array.from({ length: total }, (_, i) => Y0 + 10 + i * spacing);
  const mitad = Math.floor(total / 2);

  return (
    <>
      {/* Línea de habilitación: hasta donde puede avanzar cada equipo antes del silbato */}
      <line x1={MID - 55} y1={Y0} x2={MID - 55} y2={Y1} stroke="#b91c1c" strokeWidth="1.5" strokeDasharray="5 4" />
      <line x1={MID + 55} y1={Y0} x2={MID + 55} y2={Y1} stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x={MID - 55} y={Y0 - 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#b91c1c">línea de habilitación</text>
      <text x={MID + 55} y={Y0 - 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#1d4ed8">línea de habilitación</text>

      {balls.map((y, i) => {
        const esDeRojo = i < mitad;
        const contested = total % 2 === 1 && i === mitad;
        const stroke = contested ? '#64748b' : esDeRojo ? '#b91c1c' : '#1d4ed8';
        return <circle key={i} cx={MID} cy={y} r="7" fill="#f59e0b" stroke={stroke} strokeWidth="2" />;
      })}
      <text x={MID} y={Y1 + 32} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
        {formato === 'foam' ? '6 pelotas de espuma' : '5 pelotas de tela'} sobre la línea central · borde rojo/azul = para quién queda más cerca
      </text>
    </>
  );
};

const EliminadoOverlay: React.FC = () => (
  <>
    <text x={X0 + 30} y={(Y0 + Y1) / 2 - 10} textAnchor="middle" fontSize="16">🙋‍♂️</text>
    <text x={MID - 15} y={(Y0 + Y1) / 2 - 10} textAnchor="middle" fontSize="14">🔴</text>
    <path d={`M ${X1 - 30} ${(Y0 + Y1) / 2} L ${X0 + 45} ${(Y0 + Y1) / 2 - 10}`} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#courtArrow)" />
    <text x={X1 - 30} y={(Y0 + Y1) / 2 - 10} textAnchor="middle" fontSize="16">🙋‍♀️</text>
    <text x={X0 + 30} y={(Y0 + Y1) / 2 + 18} textAnchor="middle" fontSize="10" fontWeight="800" fill="#b91c1c">✗ eliminado</text>
    <defs>
      <marker id="courtArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" /></marker>
    </defs>
  </>
);

const VolverOverlay: React.FC = () => (
  <>
    <text x={X0 + 30} y={(Y0 + Y1) / 2 - 10} textAnchor="middle" fontSize="16">🙌</text>
    <path d={`M ${X1 - 30} ${(Y0 + Y1) / 2} L ${X0 + 45} ${(Y0 + Y1) / 2 - 10}`} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#courtArrow2)" />
    <text x={X1 - 30} y={(Y0 + Y1) / 2 - 10} textAnchor="middle" fontSize="16">🙋‍♀️</text>
    <text x={X0 + 30} y={(Y0 + Y1) / 2 + 18} textAnchor="middle" fontSize="10" fontWeight="800" fill="#1d4ed8">¡atajada!</text>
    {/* Compañero volviendo desde la cola */}
    <path d="M32 100 L58 90" stroke="#b91c1c" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#courtArrow2)" />
    <text x="32" y="90" textAnchor="middle" fontSize="14">🙋‍♂️</text>
    <text x="32" y="115" textAnchor="middle" fontSize="8" fontWeight="700" fill="#b91c1c">vuelve</text>
    <defs>
      <marker id="courtArrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" /></marker>
    </defs>
  </>
);

const GanaOverlay: React.FC = () => {
  const posicionesRojo = [0, 1, 2, 3].map((i) => Y0 + 20 + i * 26);
  const posicionesAzul = [0].map((i) => Y0 + 60 + i * 26);
  return (
    <>
      {posicionesRojo.map((y, i) => <text key={i} x={X0 + 25} y={y} textAnchor="middle" fontSize="14">🙋‍♂️</text>)}
      {posicionesAzul.map((y, i) => <text key={i} x={X1 - 25} y={y} textAnchor="middle" fontSize="14">🙋‍♀️</text>)}
      <text x={(X0 + MID) / 2} y={Y1 + 32} textAnchor="middle" fontSize="9" fontWeight="800" fill="#b91c1c">🏆 Gana Rojo: más jugadores en cancha</text>
    </>
  );
};

export const CourtDiagram: React.FC<CourtDiagramProps> = ({ mode, formato = 'foam' }) => {
  const showMedidas = mode === 'inicio' || mode === 'cancha';
  return (
    <svg viewBox="0 0 380 250" className="w-full max-w-md mx-auto" role="img" aria-label="Diagrama de la cancha de dodgeball">
      <CourtBase />
      <ColaBoxes />
      {showMedidas && <MedidasOverlay />}
      {mode === 'equipos' && <EquiposOverlay />}
      {mode === 'apertura' && <AperturaOverlay formato={formato} />}
      {mode === 'eliminado' && <EliminadoOverlay />}
      {mode === 'volver' && <VolverOverlay />}
      {mode === 'gana' && <GanaOverlay />}
    </svg>
  );
};

export default CourtDiagram;

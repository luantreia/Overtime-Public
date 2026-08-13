import React from 'react';
import Court3DScene from './court3d/Court3DScene';
import type { CourtMode, Formato } from './court3d/constants';

export type { CourtMode, Formato };

interface CourtDiagram3DProps {
  mode: CourtMode;
  formato: Formato;
  /** Cuando está en false la animación queda congelada en el instante actual. */
  corriendo: boolean;
  /** Cambiar este número reinicia la animación desde el principio. */
  reinicio: number;
  onNota: (nota: string) => void;
  className?: string;
}

/**
 * Cancha animada en 3D, vista desde arriba y algo adelante. La relación de aspecto es fija
 * (la cámara encuadra siempre los mismos metros de mundo), así que el tamaño lo define el
 * contenedor y se achica sin deformarse en mobile.
 */
export const CourtDiagram3D: React.FC<CourtDiagram3DProps> = ({
  mode,
  formato,
  corriendo,
  reinicio,
  onNota,
  className = 'w-full',
}) => (
  <div className={`mx-auto ${className}`} style={{ aspectRatio: '5 / 3' }}>
    <Court3DScene mode={mode} formato={formato} corriendo={corriendo} reinicio={reinicio} onNota={onNota} />
  </div>
);

export default CourtDiagram3D;

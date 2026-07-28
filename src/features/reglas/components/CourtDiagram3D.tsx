import React from 'react';
import Court3DScene from './court3d/Court3DScene';
import type { CourtMode } from './court3d/constants';

export type { CourtMode };

interface CourtDiagram3DProps {
  mode: CourtMode;
  formato?: 'foam' | 'cloth';
  className?: string;
}

/**
 * Cancha vista desde arriba en 3D (misma API que el CourtDiagram en SVG, para poder
 * intercambiarlos). Ancho 9m en horizontal, largo 18m en vertical -> queda en "retrato".
 * El tamaño lo define el contenedor (className) para poder achicarla en mobile sin distorsión,
 * ya que la altura sale del aspect-ratio fijo.
 */
export const CourtDiagram3D: React.FC<CourtDiagram3DProps> = ({ mode, formato = 'foam', className = 'w-full max-w-[360px]' }) => {
  return (
    <div className={`mx-auto ${className}`} style={{ aspectRatio: '9 / 19' }}>
      <Court3DScene mode={mode} formato={formato} />
    </div>
  );
};

export default CourtDiagram3D;

import React from 'react';
import Court3DScene from './court3d/Court3DScene';
import type { CourtMode } from './court3d/constants';

export type { CourtMode };

interface CourtDiagram3DProps {
  mode: CourtMode;
  formato?: 'foam' | 'cloth';
}

/**
 * Cancha vista desde arriba en 3D (misma API que el CourtDiagram en SVG, para poder
 * intercambiarlos). Ancho 9m en horizontal, largo 18m en vertical -> queda en "retrato".
 */
export const CourtDiagram3D: React.FC<CourtDiagram3DProps> = ({ mode, formato = 'foam' }) => {
  return (
    <div className="w-full mx-auto" style={{ aspectRatio: '9 / 19', maxWidth: 360, minHeight: 320 }}>
      <Court3DScene mode={mode} formato={formato} />
    </div>
  );
};

export default CourtDiagram3D;

import { TARGET_RADIUS, ZONA_OBJETIVOS } from './constants';
import type { Target } from './types';

let nextId = 0;

const randomInRange = (min: number, max: number): number => min + Math.random() * (max - min);

/** Genera un objetivo en una posición aleatoria dentro de la mitad lejana de la cancha. */
export const spawnTarget = (): Target => {
  nextId += 1;
  return {
    id: `objetivo-${nextId}`,
    position: [
      randomInRange(ZONA_OBJETIVOS.xMin, ZONA_OBJETIVOS.xMax),
      randomInRange(ZONA_OBJETIVOS.yMin, ZONA_OBJETIVOS.yMax),
      randomInRange(ZONA_OBJETIVOS.zMin, ZONA_OBJETIVOS.zMax),
    ],
    radius: TARGET_RADIUS,
  };
};

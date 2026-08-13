import type { CourtMode } from '../../types';

// Medidas reales de la cancha WDBF (Rule 1: 18 x 9 m). La escena la muestra apaisada:
// X = largo (18 m, un equipo de cada lado), Z = ancho (9 m). Con la cámara mirando desde
// arriba y algo adelante, +Z queda abajo (cerca del espectador) y -Z arriba.
export const LARGO = 18;
export const ANCHO = 9;
export const MEDIO_LARGO = LARGO / 2; // 9
export const MEDIO_ANCHO = ANCHO / 2; // 4.5
export const GROSOR_LINEA = 0.09;

export const FONDO_ROJO = -MEDIO_LARGO;
export const FONDO_AZUL = MEDIO_LARGO;

/** Fuera de la cancha: la cola de eliminados abajo, los shaggers arriba. */
export const Z_COLA = 5.9;
export const Z_SHAGGERS = -5.7;

export type Formato = 'cloth' | 'foam';

export interface EspecificacionFormato {
  pelotas: number;
  /** Metros desde el centro hasta la línea que activa una pelota agarrada en la arrancada. */
  activacion: number;
  nombreLinea: string;
  /** Signo del eje Z donde caen las pelotas designadas del equipo rojo. */
  ladoRojo: 1 | -1;
  /** Cloth deja una pelota al medio que pelean los dos; Foam las reparte todas. */
  pelotaDisputada: boolean;
}

// Cloth Rule 2.1 / 13.5 / 1.3.4 · Foam Rule 11.1.1 / 1.2.4.
// El lado designado es opuesto entre formatos: Cloth reparte por la izquierda de cada equipo
// mirando al centro, Foam por la derecha.
export const FORMATOS: Record<Formato, EspecificacionFormato> = {
  cloth: { pelotas: 5, activacion: 5.5, nombreLinea: 'línea de ataque', ladoRojo: -1, pelotaDisputada: true },
  foam: { pelotas: 6, activacion: 3, nombreLinea: 'línea de activación', ladoRojo: 1, pelotaDisputada: false },
};

/** Segundos que dura el bucle de cada escena. */
export const DURACIONES: Record<CourtMode, number> = {
  posiciones: 8,
  apertura: 11,
  lanzamiento: 9,
  catch: 10,
  bloqueo: 8,
  linea: 9.5,
  gana: 12,
};

/** Z de los 6 jugadores parados sobre su línea de fondo. */
export const ZS_JUGADORES = [-3.4, -2.05, -0.7, 0.7, 2.05, 3.4];

/** Las pelotas van sobre la línea central, separadas 1.5 m (Cloth Rule 1.3.6). */
export const posicionesPelotas = (fmt: Formato): number[] => {
  const n = FORMATOS[fmt].pelotas;
  const inicio = -((n - 1) * 1.5) / 2;
  return Array.from({ length: n }, (_, i) => inicio + i * 1.5);
};

export const duenioPelota = (fmt: Formato, z: number): 'rojo' | 'azul' | 'libre' => {
  const spec = FORMATOS[fmt];
  if (spec.pelotaDisputada && Math.abs(z) < 0.01) return 'libre';
  return Math.sign(z) === spec.ladoRojo ? 'rojo' : 'azul';
};

export type { CourtMode };

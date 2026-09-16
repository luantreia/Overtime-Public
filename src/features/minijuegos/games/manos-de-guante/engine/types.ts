import type { GameStatus } from '../../../shared/types';

export interface TiroEntrante {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** false = ya picó en el piso: no elimina y no se puede atajar para sumar. */
  viva: boolean;
}

export type TipoAviso = 'atajada' | 'perfecta' | 'golpe' | 'manotazo' | 'dejaste-pasar';

export interface Aviso {
  tipo: TipoAviso;
  /** Segundos que lleva en pantalla; el renderer lo usa para desvanecerlo. */
  edad: number;
}

export interface ManosSnapshot {
  status: GameStatus;
  tiros: TiroEntrante[];
  vidas: number;
  score: number;
  highScore: number;
  combo: number;
  mejorCombo: number;
  /** Atajadas de la partida: cada una devuelve un compañero a la cancha. */
  companeros: number;
  /** Segundos que faltan para recuperar las manos tras un manotazo. 0 = listo. */
  castigo: number;
  aviso: Aviso | null;
}

export interface ManosHudState {
  status: GameStatus;
  score: number;
  highScore: number;
  vidas: number;
  combo: number;
  companeros: number;
  mejorCombo: number;
  isNewHighScore: boolean;
}

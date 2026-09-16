import type { GameStatus } from '../../../shared/types';

/** Bloquear está permitido en 'normal' y elimina en 'no-blocking'. Esquivar sirve siempre. */
export type Fase = 'normal' | 'no-blocking';

export type Accion = 'bloquear' | 'esquivar';

export interface TiroMuralla {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type TipoAviso = 'bloqueo' | 'esquive' | 'golpe' | 'bloqueo-ilegal' | 'tarde';

export interface Aviso {
  tipo: TipoAviso;
  edad: number;
}

export interface MurallaSnapshot {
  status: GameStatus;
  fase: Fase;
  tiros: TiroMuralla[];
  vidas: number;
  score: number;
  highScore: number;
  combo: number;
  mejorCombo: number;
  bloqueos: number;
  /** Tiros que faltan para que cambie la fase. */
  tirosRestantesFase: number;
  /** >0 mientras se muestra el cartel de cambio de fase. */
  anuncio: number;
  /** Gesto en curso, para dibujar la pose: se apaga solo. */
  gesto: { accion: Accion; edad: number } | null;
  aviso: Aviso | null;
}

export interface MurallaHudState {
  status: GameStatus;
  fase: Fase;
  score: number;
  highScore: number;
  vidas: number;
  combo: number;
  bloqueos: number;
  mejorCombo: number;
  isNewHighScore: boolean;
}

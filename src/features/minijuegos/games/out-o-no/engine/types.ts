import type { GameStatus } from '../../../shared/types';

export type FormatoSituacion = 'cloth' | 'foam' | 'ambos';

export interface Situacion {
  id: string;
  /** La jugada, contada en una frase. */
  texto: string;
  esOut: boolean;
  /** Por qué, en criollo. Se muestra después de responder. */
  explicacion: string;
  /** Regla que la resuelve, para poder ir a verificarla al reglamento. */
  regla: string;
  formato: FormatoSituacion;
}

export interface Respuesta {
  situacion: Situacion;
  /** null = se acabó el tiempo sin responder. */
  eligioOut: boolean | null;
  acerto: boolean;
  puntos: number;
}

export interface OutONoSnapshot {
  status: GameStatus;
  situacion: Situacion | null;
  indice: number;
  total: number;
  /** Segundos que quedan para responder la actual. */
  restante: number;
  /** Fracción 0..1 del tiempo que queda, para la barra. */
  fraccion: number;
  /** La última respuesta, mientras se muestra la devolución. */
  ultima: Respuesta | null;
  mostrandoDevolucion: boolean;
  score: number;
  highScore: number;
  aciertos: number;
  racha: number;
  mejorRacha: number;
}

export interface OutONoHudState {
  status: GameStatus;
  score: number;
  highScore: number;
  indice: number;
  total: number;
  aciertos: number;
  racha: number;
  mejorRacha: number;
  isNewHighScore: boolean;
}

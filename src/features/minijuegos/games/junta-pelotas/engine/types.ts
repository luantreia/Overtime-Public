import type { GameStatus } from '../../../shared/types';

export interface PelotaAfuera {
  id: string;
  x: number;
  /** Posición vertical mientras sale rodando de la cancha hacia el pasillo. */
  y: number;
  /** Destino vertical: el pasillo del shagger. */
  yDestino: number;
  /** false para las que salen del lado del rival: no las podés juntar. */
  alcanzable: boolean;
}

export type TipoAviso = 'juntada' | 'entrega' | 'carga-llena' | 'tope' | 'llena';

export interface Aviso {
  tipo: TipoAviso;
  edad: number;
}

export interface JuntaSnapshot {
  status: GameStatus;
  shaggerX: number;
  /** Cuántas pelotas lleva encima ahora mismo. */
  carga: number;
  pelotas: PelotaAfuera[];
  suministro: number;
  score: number;
  highScore: number;
  entregadas: number;
  segundos: number;
  aviso: Aviso | null;
}

export interface JuntaHudState {
  status: GameStatus;
  score: number;
  highScore: number;
  carga: number;
  suministro: number;
  entregadas: number;
  segundos: number;
  isNewHighScore: boolean;
}

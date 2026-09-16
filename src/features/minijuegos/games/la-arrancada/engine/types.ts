import type { GameStatus } from '../../../shared/types';
import type { Vector2 } from '../../../shared/types';

export interface PelotaLibre {
  id: string;
  x: number;
  y: number;
  /** true mientras nadie la levantó. */
  disponible: boolean;
}

export interface TiroRival {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type EstadoRival = 'yendo' | 'volviendo' | 'armado';

export interface Rival {
  id: string;
  x: number;
  y: number;
  estado: EstadoRival;
  /** Pelota que fue a buscar, si todavía está yendo. */
  objetivoId: string | null;
  /** Segundos hasta el próximo tiro, solo cuenta en estado 'armado'. */
  recarga: number;
}

export type TipoAviso = 'activada' | 'golpe' | 'levantada' | 'sin-activar';

export interface Aviso {
  tipo: TipoAviso;
  edad: number;
}

export interface ArrancadaSnapshot {
  status: GameStatus;
  jugador: Vector2;
  /** true si va cargando una pelota sin activar. */
  llevaPelota: boolean;
  pelotas: PelotaLibre[];
  rivales: Rival[];
  tiros: TiroRival[];
  vidas: number;
  score: number;
  highScore: number;
  activadas: number;
  segundosRestantes: number;
  aviso: Aviso | null;
}

export interface ArrancadaHudState {
  status: GameStatus;
  score: number;
  highScore: number;
  vidas: number;
  activadas: number;
  llevaPelota: boolean;
  segundosRestantes: number;
  isNewHighScore: boolean;
}

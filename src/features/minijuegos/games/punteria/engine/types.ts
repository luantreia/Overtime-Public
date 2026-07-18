import type { GameStatus } from '../../../shared/types';

export type { GameStatus };

export interface Target {
  id: string;
  position: [number, number, number];
  radius: number;
}

export interface PunteriaHudState {
  status: GameStatus;
  score: number;
  timeLeft: number;
}

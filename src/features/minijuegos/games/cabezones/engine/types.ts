import type { Vector2, GameStatus } from '../../../shared/types';

export type { Vector2, GameStatus };

export type PlayerSide = 'left' | 'right';

export interface CabezonPlayer {
  id: string;
  side: PlayerSide;
  isUserControlled: boolean;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  grounded: boolean;
  lives: number;
  hasBallId: string | null;
  attemptingCatch: boolean;
  invulnerableUntil: number;
  throwCooldownUntil: number;
}

export type BallState = 'loose' | 'flying' | 'held';

export interface CabezonBall {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  spin: number;
  rotation: number;
  state: BallState;
  heldBy: string | null;
  thrownBy: string | null;
}

export interface CabezonesSnapshot {
  players: CabezonPlayer[];
  balls: CabezonBall[];
  status: GameStatus;
  winner?: PlayerSide | 'draw';
}

export interface CabezonesHudState {
  status: GameStatus;
  livesLeft: number;
  livesRight: number;
  winner?: PlayerSide | 'draw';
}

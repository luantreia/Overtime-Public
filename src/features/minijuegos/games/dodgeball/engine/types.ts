import type { Vector2, GameStatus } from '../../../shared/types';

export type TeamSide = 'player' | 'ai';

export type PlayerAnimState = 'idle' | 'run' | 'throw' | 'catch' | 'eliminated';

export interface PlayerEntity {
  id: string;
  team: TeamSide;
  isUserControlled: boolean;
  position: Vector2;
  radius: number;
  color: string;
  alive: boolean;
  hasBall: boolean;
  speed: number;
  speedBoostUntil: number;
  shieldActive: boolean;
  poweredThrowReady: boolean;
  animState: PlayerAnimState;
  animPhase: number;
  animStateUntil: number;
  facing: Vector2;
  throwCooldownUntil: number;
  attemptingCatch: boolean;
}

export type BallState = 'loose' | 'flying' | 'held';

export interface BallEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  state: BallState;
  heldBy?: string;
  thrownBy?: string;
  powered: boolean;
  expiresAt?: number;
}

export type PowerUpType = 'speed' | 'power' | 'shield' | 'multiball';

export interface PowerUpEntity {
  id: string;
  type: PowerUpType;
  position: Vector2;
  radius: number;
}

export interface GameSnapshot {
  players: PlayerEntity[];
  balls: BallEntity[];
  powerUps: PowerUpEntity[];
  eliminationsPlayerTeam: number;
  eliminationsAiTeam: number;
  aliveOnPlayerTeam: number;
  aliveOnAiTeam: number;
  timeRemaining: number;
  status: GameStatus;
  winner?: TeamSide | 'draw';
  activePowerUp: PowerUpType | null;
}

export interface InputSnapshot {
  moveX: number;
  moveY: number;
  throwPressed: boolean;
  catchHeld: boolean;
}

export interface HudState {
  status: GameStatus;
  eliminationsPlayerTeam: number;
  eliminationsAiTeam: number;
  timeRemaining: number;
  activePowerUp: PowerUpType | null;
  winner?: TeamSide | 'draw';
}

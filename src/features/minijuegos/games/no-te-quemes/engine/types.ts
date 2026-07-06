import type { GameStatus } from '../../../shared/types';

export type LaneIndex = 0 | 1 | 2;

export interface FallingBall {
  id: string;
  lane: LaneIndex;
  y: number;
}

export interface NoTeQuemesSnapshot {
  status: GameStatus;
  playerLane: LaneIndex;
  balls: FallingBall[];
  survivedSeconds: number;
  score: number;
  highScore: number;
}

export interface NoTeQuemesHudState {
  status: GameStatus;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
}

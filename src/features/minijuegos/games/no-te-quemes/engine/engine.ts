import type { FallingBall, LaneIndex, NoTeQuemesSnapshot } from './types';
import type { GameStatus } from '../../../shared/types';
import type { GameAudio } from '../../../shared/audio';
import {
  LANES,
  CANVAS_HEIGHT,
  PLAYER_Y,
  PLAYER_RADIUS,
  BALL_RADIUS,
  INITIAL_FALL_SPEED,
  MAX_FALL_SPEED,
  FALL_SPEED_RAMP_PER_SEC,
  INITIAL_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  SPAWN_INTERVAL_RAMP_PER_SEC,
  HIGH_SCORE_KEY,
} from './constants';

const MAX_DT = 0.05;

const readHighScore = (): number => {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  const value = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(value) ? value : 0;
};

const writeHighScore = (value: number) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HIGH_SCORE_KEY, String(value));
};

export class NoTeQuemesEngine {
  status: GameStatus = 'ready';
  playerLane: LaneIndex = 1;
  balls: FallingBall[] = [];
  survivedSeconds = 0;
  highScore = readHighScore();
  isNewHighScore = false;

  private nextId = 0;
  private spawnTimer = INITIAL_SPAWN_INTERVAL;
  private pendingLaneMove: -1 | 0 | 1 = 0;

  constructor(private audio: GameAudio) {}

  private genId(): string {
    this.nextId += 1;
    return `b${this.nextId}`;
  }

  reset() {
    this.status = 'ready';
    this.playerLane = 1;
    this.balls = [];
    this.survivedSeconds = 0;
    this.spawnTimer = INITIAL_SPAWN_INTERVAL;
    this.isNewHighScore = false;
  }

  start() {
    this.reset();
    this.status = 'playing';
    this.audio.playWhistle();
  }

  requestLaneMove(direction: -1 | 1) {
    this.pendingLaneMove = direction;
  }

  update(dtSeconds: number) {
    if (this.status !== 'playing') return;
    const dt = Math.min(dtSeconds, MAX_DT);
    this.survivedSeconds += dt;

    if (this.pendingLaneMove !== 0) {
      const next = this.playerLane + this.pendingLaneMove;
      if (next >= 0 && next < LANES) {
        this.playerLane = next as LaneIndex;
      }
      this.pendingLaneMove = 0;
    }

    const fallSpeed = Math.min(MAX_FALL_SPEED, INITIAL_FALL_SPEED + this.survivedSeconds * FALL_SPEED_RAMP_PER_SEC);
    const spawnInterval = Math.max(
      MIN_SPAWN_INTERVAL,
      INITIAL_SPAWN_INTERVAL - this.survivedSeconds * SPAWN_INTERVAL_RAMP_PER_SEC
    );

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = spawnInterval;
      this.balls.push({
        id: this.genId(),
        lane: Math.floor(Math.random() * LANES) as LaneIndex,
        y: -BALL_RADIUS,
      });
    }

    for (const ball of this.balls) {
      ball.y += fallSpeed * dt;
    }

    const survivors: FallingBall[] = [];
    for (const ball of this.balls) {
      const hit = ball.lane === this.playerLane && Math.abs(ball.y - PLAYER_Y) < BALL_RADIUS + PLAYER_RADIUS;
      if (hit) {
        this.triggerGameOver();
        return;
      }
      if (ball.y - BALL_RADIUS <= CANVAS_HEIGHT) {
        survivors.push(ball);
      }
    }
    this.balls = survivors;
  }

  private triggerGameOver() {
    this.status = 'gameover';
    const finalScore = Math.floor(this.survivedSeconds * 10);
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      this.isNewHighScore = true;
      writeHighScore(finalScore);
    }
    this.audio.playHit();
    this.audio.playWhistle();
  }

  getSnapshot(): NoTeQuemesSnapshot {
    return {
      status: this.status,
      playerLane: this.playerLane,
      balls: this.balls,
      survivedSeconds: this.survivedSeconds,
      score: Math.floor(this.survivedSeconds * 10),
      highScore: this.highScore,
    };
  }
}

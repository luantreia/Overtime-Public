import type {
  CabezonBall,
  CabezonPlayer,
  CabezonesSnapshot,
  GameStatus,
  PlayerSide,
  Vector2,
} from './types';
import { circlesOverlap } from '../../../shared/collisions';
import { integrate, resolveGroundCollision, resolveWallCollision, resolveCircleCollision } from '../../../shared/physics';
import { computeCabezonesAiIntent } from './ai';
import type { GameAudio } from '../../../shared/audio';
import {
  AI_THROW_COOLDOWN,
  BALL_MASS,
  BALL_RADIUS,
  BALL_RESTITUTION,
  CENTER_X,
  COURT_WIDTH,
  GRAVITY,
  GROUND_Y,
  HIT_INVULNERABILITY,
  INITIAL_LIVES,
  JUMP_VELOCITY,
  PLAYER_MOVE_SPEED,
  PLAYER_RADIUS,
  SPIN_CURVE_FACTOR,
} from './constants';

const MAX_DT = 0.05;

export interface CabezonesUserInput {
  moveX: number;
  jumpPressed: boolean;
  catchHeld: boolean;
}

/** Pure "what-if" simulation used by the UI to draw the live aim preview while dragging. Doesn't touch engine state. */
export const simulateTrajectory = (from: Vector2, velocity: Vector2, spin: number, steps = 26, dt = 0.045): Vector2[] => {
  const points: Vector2[] = [];
  let pos: Vector2 = { ...from };
  let vel: Vector2 = { ...velocity };
  for (let i = 0; i < steps; i += 1) {
    vel = { x: vel.x + spin * vel.y * SPIN_CURVE_FACTOR * dt, y: vel.y + GRAVITY * dt };
    pos = { x: pos.x + vel.x * dt, y: pos.y + vel.y * dt };
    if (pos.y > GROUND_Y || pos.x < 0 || pos.x > COURT_WIDTH) break;
    points.push(pos);
  }
  return points;
};

export class CabezonesEngine {
  players: CabezonPlayer[] = [];
  balls: CabezonBall[] = [];
  status: GameStatus = 'ready';
  winner?: PlayerSide | 'draw';

  private clock = 0;
  private nextId = 0;
  private userInput: CabezonesUserInput = { moveX: 0, jumpPressed: false, catchHeld: false };

  constructor(private audio: GameAudio) {
    this.reset();
  }

  private genId(): string {
    this.nextId += 1;
    return `c${this.nextId}`;
  }

  reset() {
    this.status = 'ready';
    this.winner = undefined;
    this.players = [this.createPlayer('left', true), this.createPlayer('right', false)];
    this.balls = [0, 1, 2].map((i) =>
      this.createBall({ x: CENTER_X + (i - 1) * 40, y: GROUND_Y - BALL_RADIUS })
    );
  }

  start() {
    this.reset();
    this.status = 'playing';
    this.audio.playWhistle();
  }

  setUserInput(input: CabezonesUserInput) {
    this.userInput = input;
  }

  /** Called by the UI on pointerup, once a drag-throw is released. */
  throwHeldBall(velocity: Vector2, spin: number) {
    const human = this.players.find((p) => p.isUserControlled);
    if (!human || !human.hasBallId) return;
    this.executeThrow(human, velocity, spin);
  }

  private createPlayer(side: PlayerSide, isUserControlled: boolean): CabezonPlayer {
    const x = side === 'left' ? COURT_WIDTH * 0.25 : COURT_WIDTH * 0.75;
    return {
      id: this.genId(),
      side,
      isUserControlled,
      position: { x, y: GROUND_Y - PLAYER_RADIUS },
      velocity: { x: 0, y: 0 },
      radius: PLAYER_RADIUS,
      grounded: true,
      lives: INITIAL_LIVES,
      hasBallId: null,
      attemptingCatch: false,
      invulnerableUntil: 0,
      throwCooldownUntil: 0,
    };
  }

  private createBall(position: Vector2): CabezonBall {
    return {
      id: this.genId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      spin: 0,
      rotation: 0,
      state: 'loose',
      heldBy: null,
      thrownBy: null,
    };
  }

  update(dtSeconds: number) {
    const dt = Math.min(dtSeconds, MAX_DT);
    this.clock += dt;

    this.updatePlayers(dt);
    this.updateBalls(dt);
    this.checkHits();

    if (this.status === 'playing') {
      this.checkWinCondition();
    }
  }

  private updatePlayers(dt: number) {
    const [human, ai] = this.players;

    for (const player of this.players) {
      const opponent = player === human ? ai : human;

      let moveX = 0;
      let wantJump = false;
      let wantCatch = false;

      if (player.isUserControlled) {
        moveX = this.userInput.moveX;
        wantJump = this.userInput.jumpPressed;
        wantCatch = this.userInput.catchHeld;
      } else if (this.status === 'playing') {
        const intent = computeCabezonesAiIntent({ self: player, opponent, balls: this.balls });
        moveX = intent.moveX;
        wantJump = intent.wantJump;
        wantCatch = intent.wantCatch;
        if (intent.wantThrow && player.hasBallId && this.clock >= player.throwCooldownUntil && intent.throwVelocity) {
          this.executeThrow(player, intent.throwVelocity, intent.throwSpin || 0);
        }
      }

      player.attemptingCatch = wantCatch;
      player.velocity.x = moveX * PLAYER_MOVE_SPEED;

      if (wantJump && player.grounded) {
        player.velocity.y = JUMP_VELOCITY;
        player.grounded = false;
      }

      integrate(player.position, player.velocity, GRAVITY, dt);
      player.grounded = resolveGroundCollision(player.position, player.velocity, player.radius, GROUND_Y, 0);

      const minX = player.side === 'left' ? player.radius : CENTER_X + player.radius;
      const maxX = player.side === 'left' ? CENTER_X - player.radius : COURT_WIDTH - player.radius;
      player.position.x = Math.min(maxX, Math.max(minX, player.position.x));
    }
  }

  private executeThrow(thrower: CabezonPlayer, velocity: Vector2, spin: number) {
    const ball = this.balls.find((b) => b.id === thrower.hasBallId);
    if (!ball) return;

    ball.state = 'flying';
    ball.velocity = { ...velocity };
    ball.spin = Math.max(-6, Math.min(6, spin));
    ball.thrownBy = thrower.id;
    ball.heldBy = null;

    thrower.hasBallId = null;
    thrower.throwCooldownUntil = this.clock + AI_THROW_COOLDOWN;

    this.audio.playThrow();
  }

  private updateBalls(dt: number) {
    for (const ball of this.balls) {
      if (ball.state === 'held') {
        const holder = this.players.find((p) => p.id === ball.heldBy);
        if (holder) {
          ball.position = { x: holder.position.x, y: holder.position.y - holder.radius - ball.radius };
        }
        continue;
      }

      ball.velocity.x += ball.spin * ball.velocity.y * SPIN_CURVE_FACTOR * dt;
      integrate(ball.position, ball.velocity, GRAVITY, dt);
      ball.rotation += (ball.spin * 2 + ball.velocity.x * 0.05) * dt;

      resolveGroundCollision(ball.position, ball.velocity, ball.radius, GROUND_Y, BALL_RESTITUTION);
      resolveWallCollision(ball.position, ball.velocity, ball.radius, 0, COURT_WIDTH, BALL_RESTITUTION);

      if (ball.state === 'flying' && Math.hypot(ball.velocity.x, ball.velocity.y) < 45) {
        ball.state = 'loose';
        ball.thrownBy = null;
        ball.spin = 0;
      }
    }

    for (let i = 0; i < this.balls.length; i += 1) {
      for (let j = i + 1; j < this.balls.length; j += 1) {
        const a = this.balls[i];
        const b = this.balls[j];
        if (a.state === 'held' || b.state === 'held') continue;
        resolveCircleCollision(
          { position: a.position, velocity: a.velocity, radius: a.radius, mass: BALL_MASS },
          { position: b.position, velocity: b.velocity, radius: b.radius, mass: BALL_MASS },
          BALL_RESTITUTION
        );
      }
    }

    for (const ball of this.balls) {
      if (ball.state !== 'loose') continue;
      const carrier = this.players.find((p) => !p.hasBallId && circlesOverlap(ball.position, ball.radius, p.position, p.radius));
      if (carrier) {
        ball.state = 'held';
        ball.heldBy = carrier.id;
        ball.velocity = { x: 0, y: 0 };
        carrier.hasBallId = ball.id;
      }
    }
  }

  private checkHits() {
    for (const ball of this.balls) {
      if (ball.state !== 'flying') continue;

      const target = this.players.find((p) => p.id !== ball.thrownBy);
      if (!target || this.clock < target.invulnerableUntil) continue;
      if (!circlesOverlap(ball.position, ball.radius, target.position, target.radius)) continue;

      if (target.hasBallId) {
        const heldBall = this.balls.find((b) => b.id === target.hasBallId);
        if (heldBall) {
          heldBall.state = 'flying';
          heldBall.heldBy = null;
          heldBall.thrownBy = null;
          target.hasBallId = null;
          resolveCircleCollision(
            { position: ball.position, velocity: ball.velocity, radius: ball.radius, mass: BALL_MASS },
            { position: heldBall.position, velocity: heldBall.velocity, radius: heldBall.radius, mass: BALL_MASS },
            BALL_RESTITUTION
          );
        }
        this.audio.playHit();
      } else if (target.attemptingCatch) {
        ball.state = 'held';
        ball.heldBy = target.id;
        ball.thrownBy = null;
        ball.velocity = { x: 0, y: 0 };
        target.hasBallId = ball.id;
        this.audio.playCatch();
      } else {
        target.lives -= 1;
        target.invulnerableUntil = this.clock + HIT_INVULNERABILITY;
        this.audio.playHit();
        this.audio.playEliminate();
        const heavyTarget = { position: target.position, velocity: { x: 0, y: 0 }, radius: target.radius, mass: 20 };
        resolveCircleCollision(
          { position: ball.position, velocity: ball.velocity, radius: ball.radius, mass: BALL_MASS },
          heavyTarget,
          0.5
        );
      }
    }
  }

  private checkWinCondition() {
    const [human, ai] = this.players;
    if (human.lives <= 0 || ai.lives <= 0) {
      this.status = 'gameover';
      this.winner = human.lives <= 0 && ai.lives <= 0 ? 'draw' : human.lives <= 0 ? 'right' : 'left';
      this.audio.playWhistle();
    }
  }

  getSnapshot(): CabezonesSnapshot {
    return {
      players: this.players,
      balls: this.balls,
      status: this.status,
      winner: this.winner,
    };
  }
}

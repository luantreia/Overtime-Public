import type {
  BallEntity,
  GameSnapshot,
  GameStatus,
  InputSnapshot,
  PlayerEntity,
  PowerUpEntity,
  PowerUpType,
  TeamSide,
  Vector2,
} from './types';
import { circlesOverlap, clampPositionToBounds, normalize } from './collisions';
import { computeAiIntent, findNearestOpponent } from './ai';
import {
  BALL_RADIUS,
  BALL_THROW_SPEED,
  BALL_THROW_SPEED_POWERED,
  CENTER_LINE_Y,
  COURT_HEIGHT,
  COURT_WIDTH,
  MATCH_DURATION,
  PLAYER_BASE_SPEED,
  PLAYER_RADIUS,
  POWERUP_RADIUS,
  POWERUP_SPAWN_INTERVAL,
  POWERUP_MAX_ON_COURT,
  POWERUP_TYPES,
  SPEED_BOOST_DURATION,
  SPEED_BOOST_MULTIPLIER,
  TEAM_COLORS,
  TEAM_SIZE,
  THROW_COOLDOWN,
} from './constants';
import type { GameAudio } from './audio';

const MAX_DT = 0.05;

export class DodgeballEngine {
  players: PlayerEntity[] = [];
  balls: BallEntity[] = [];
  powerUps: PowerUpEntity[] = [];
  status: GameStatus = 'ready';
  timeRemaining = MATCH_DURATION;
  eliminationsPlayerTeam = 0;
  eliminationsAiTeam = 0;
  winner?: TeamSide | 'draw';

  private clock = 0;
  private nextId = 0;
  private userInput: InputSnapshot = { moveX: 0, moveY: 0, throwPressed: false, catchHeld: false };
  private powerUpSpawnTimer = POWERUP_SPAWN_INTERVAL;
  private hudPowerUpType: PowerUpType | null = null;
  private hudPowerUpUntil = 0;

  constructor(private audio: GameAudio) {
    this.reset();
  }

  private genId(): string {
    this.nextId += 1;
    return `e${this.nextId}`;
  }

  reset() {
    this.players = [];
    this.balls = [];
    this.powerUps = [];
    this.status = 'ready';
    this.timeRemaining = MATCH_DURATION;
    this.eliminationsPlayerTeam = 0;
    this.eliminationsAiTeam = 0;
    this.winner = undefined;
    this.powerUpSpawnTimer = POWERUP_SPAWN_INTERVAL;
    this.spawnTeam('player');
    this.spawnTeam('ai');
    this.spawnBall();
  }

  start() {
    this.reset();
    this.status = 'playing';
    this.audio.playWhistle();
  }

  setUserInput(input: InputSnapshot) {
    this.userInput = input;
  }

  private spawnTeam(team: TeamSide) {
    const colors = TEAM_COLORS[team];
    const baseY = team === 'player' ? COURT_HEIGHT - 60 : 60;
    const facing: Vector2 = team === 'player' ? { x: 0, y: -1 } : { x: 0, y: 1 };
    for (let i = 0; i < TEAM_SIZE; i += 1) {
      const x = COURT_WIDTH * ((i + 1) / (TEAM_SIZE + 1));
      const player: PlayerEntity = {
        id: this.genId(),
        team,
        isUserControlled: team === 'player' && i === 0,
        position: { x, y: baseY },
        radius: PLAYER_RADIUS,
        color: colors.body,
        alive: true,
        hasBall: false,
        speed: PLAYER_BASE_SPEED,
        speedBoostUntil: 0,
        shieldActive: false,
        poweredThrowReady: false,
        animState: 'idle',
        animPhase: Math.random() * Math.PI * 2,
        animStateUntil: 0,
        facing,
        throwCooldownUntil: 0,
        attemptingCatch: false,
      };
      this.players.push(player);
    }
  }

  private spawnBall(position?: Vector2) {
    this.balls.push({
      id: this.genId(),
      position: position ? { ...position } : { x: COURT_WIDTH / 2, y: CENTER_LINE_Y },
      velocity: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      state: 'loose',
      powered: false,
    });
  }

  update(dtSeconds: number) {
    const dt = Math.min(dtSeconds, MAX_DT);
    this.clock += dt;

    if (this.status === 'playing') {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    }

    this.updatePlayers(dt);
    this.updateBalls(dt);
    this.updatePowerUps(dt);

    if (this.status === 'playing') {
      this.checkWinCondition();
    }
  }

  private updatePlayers(dt: number) {
    for (const player of this.players) {
      if (!player.alive) {
        player.animState = 'eliminated';
        continue;
      }

      let moveX: number;
      let moveY: number;
      let throwWanted: boolean;
      let catchWanted: boolean;

      if (player.isUserControlled) {
        moveX = this.userInput.moveX;
        moveY = this.userInput.moveY;
        throwWanted = this.userInput.throwPressed;
        catchWanted = this.userInput.catchHeld;
      } else {
        const intent = computeAiIntent(player, { players: this.players, balls: this.balls });
        moveX = intent.moveX;
        moveY = intent.moveY;
        throwWanted = intent.wantThrow;
        catchWanted = intent.wantCatch;
      }

      player.attemptingCatch = catchWanted;

      const dir = normalize({ x: moveX, y: moveY });
      const speedFactor = this.clock < player.speedBoostUntil ? SPEED_BOOST_MULTIPLIER : 1;
      const effectiveSpeed = player.speed * speedFactor;

      player.position.x += dir.x * effectiveSpeed * dt;
      player.position.y += dir.y * effectiveSpeed * dt;

      const minY = player.team === 'player' ? CENTER_LINE_Y : 0;
      const maxY = player.team === 'player' ? COURT_HEIGHT : CENTER_LINE_Y;
      clampPositionToBounds(player.position, player.radius, 0, COURT_WIDTH, minY, maxY);

      if (dir.x !== 0 || dir.y !== 0) {
        player.facing = dir;
      }

      if (throwWanted && player.hasBall && this.clock >= player.throwCooldownUntil) {
        this.executeThrow(player);
      }

      if (this.clock >= player.animStateUntil) {
        player.animState = dir.x !== 0 || dir.y !== 0 ? 'run' : 'idle';
      }
      player.animPhase += dt * (player.animState === 'run' ? 6 : 2);
    }
  }

  private executeThrow(thrower: PlayerEntity) {
    const ball = this.balls.find((b) => b.heldBy === thrower.id);
    if (!ball) return;

    const target = findNearestOpponent(thrower, this.players);
    const targetPos = target ? target.position : { x: thrower.position.x, y: thrower.team === 'player' ? 0 : COURT_HEIGHT };
    const dir = normalize({ x: targetPos.x - thrower.position.x, y: targetPos.y - thrower.position.y });

    const powered = thrower.poweredThrowReady;
    const speed = powered ? BALL_THROW_SPEED_POWERED : BALL_THROW_SPEED;

    ball.state = 'flying';
    ball.velocity = { x: dir.x * speed, y: dir.y * speed };
    ball.thrownBy = thrower.id;
    ball.heldBy = undefined;
    ball.powered = powered;

    thrower.hasBall = false;
    thrower.poweredThrowReady = false;
    thrower.throwCooldownUntil = this.clock + THROW_COOLDOWN;
    thrower.animState = 'throw';
    thrower.animStateUntil = this.clock + 0.25;

    this.audio.playThrow();
  }

  private updateBalls(dt: number) {
    for (const ball of this.balls) {
      if (ball.state === 'flying') {
        ball.position.x += ball.velocity.x * dt;
        ball.position.y += ball.velocity.y * dt;

        const outOfBounds =
          ball.position.x < ball.radius ||
          ball.position.x > COURT_WIDTH - ball.radius ||
          ball.position.y < ball.radius ||
          ball.position.y > COURT_HEIGHT - ball.radius;

        if (outOfBounds) {
          clampPositionToBounds(ball.position, ball.radius, 0, COURT_WIDTH, 0, COURT_HEIGHT);
          this.settleBall(ball);
          continue;
        }

        const thrower = this.players.find((p) => p.id === ball.thrownBy);
        const opponents = this.players.filter((p) => p.alive && (!thrower || p.team !== thrower.team));

        for (const opponent of opponents) {
          if (!circlesOverlap(ball.position, ball.radius, opponent.position, opponent.radius)) continue;

          if (opponent.attemptingCatch) {
            this.audio.playCatch();
            if (thrower) {
              thrower.alive = false;
              thrower.animState = 'eliminated';
              this.registerElimination(opponent.team);
            }
            opponent.animState = 'catch';
            opponent.animStateUntil = this.clock + 0.3;
            this.attachBallToHolder(ball, opponent);
          } else if (opponent.shieldActive) {
            opponent.shieldActive = false;
            this.audio.playHit();
            this.settleBall(ball, opponent.position);
          } else {
            opponent.alive = false;
            opponent.animState = 'eliminated';
            opponent.animStateUntil = this.clock + 1;
            this.audio.playHit();
            this.audio.playEliminate();
            if (thrower) this.registerElimination(thrower.team);
            this.settleBall(ball, opponent.position);
          }
          break;
        }
      } else if (ball.state === 'held') {
        const holder = this.players.find((p) => p.id === ball.heldBy);
        if (holder) {
          ball.position = { x: holder.position.x, y: holder.position.y - holder.radius - ball.radius };
        }
      } else {
        this.tryPickup(ball);
      }
    }
  }

  private registerElimination(scoringTeam: TeamSide) {
    if (scoringTeam === 'player') this.eliminationsPlayerTeam += 1;
    else this.eliminationsAiTeam += 1;
  }

  private settleBall(ball: BallEntity, position?: Vector2) {
    ball.state = 'loose';
    ball.velocity = { x: 0, y: 0 };
    ball.powered = false;
    ball.thrownBy = undefined;
    ball.heldBy = undefined;
    if (position) ball.position = { ...position };
  }

  private attachBallToHolder(ball: BallEntity, holder: PlayerEntity) {
    ball.state = 'held';
    ball.heldBy = holder.id;
    ball.thrownBy = undefined;
    ball.powered = false;
    holder.hasBall = true;
  }

  private tryPickup(ball: BallEntity) {
    const carrier = this.players.find(
      (p) => p.alive && !p.hasBall && circlesOverlap(ball.position, ball.radius, p.position, p.radius)
    );
    if (carrier) {
      this.attachBallToHolder(ball, carrier);
    }
  }

  private updatePowerUps(dt: number) {
    if (this.status === 'playing') {
      this.powerUpSpawnTimer -= dt;
      if (this.powerUpSpawnTimer <= 0 && this.powerUps.length < POWERUP_MAX_ON_COURT) {
        this.spawnPowerUp();
        this.powerUpSpawnTimer = POWERUP_SPAWN_INTERVAL;
      }
    }

    this.powerUps = this.powerUps.filter((powerUp) => {
      const collector = this.players.find(
        (p) => p.alive && circlesOverlap(p.position, p.radius, powerUp.position, powerUp.radius)
      );
      if (!collector) return true;
      this.applyPowerUp(collector, powerUp.type);
      return false;
    });
  }

  private spawnPowerUp() {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    const margin = POWERUP_RADIUS * 2;
    this.powerUps.push({
      id: this.genId(),
      type,
      radius: POWERUP_RADIUS,
      position: {
        x: margin + Math.random() * (COURT_WIDTH - margin * 2),
        y: CENTER_LINE_Y + (Math.random() - 0.5) * 80,
      },
    });
  }

  private applyPowerUp(player: PlayerEntity, type: PowerUpType) {
    switch (type) {
      case 'speed':
        player.speedBoostUntil = this.clock + SPEED_BOOST_DURATION;
        break;
      case 'power':
        player.poweredThrowReady = true;
        break;
      case 'shield':
        player.shieldActive = true;
        break;
      case 'multiball':
        if (this.balls.length < 2) {
          this.spawnBall({ x: player.position.x, y: player.position.y });
        }
        break;
      default:
        break;
    }

    this.audio.playPowerUp();
    if (player.isUserControlled) {
      this.hudPowerUpType = type;
      this.hudPowerUpUntil = this.clock + 3;
    }
  }

  private checkWinCondition() {
    const aliveOnPlayerTeam = this.players.filter((p) => p.team === 'player' && p.alive).length;
    const aliveOnAiTeam = this.players.filter((p) => p.team === 'ai' && p.alive).length;

    if (aliveOnPlayerTeam === 0 || aliveOnAiTeam === 0) {
      this.status = 'gameover';
      this.winner = aliveOnPlayerTeam === 0 && aliveOnAiTeam === 0 ? 'draw' : aliveOnPlayerTeam === 0 ? 'ai' : 'player';
      this.audio.playWhistle();
      return;
    }

    if (this.timeRemaining <= 0) {
      this.status = 'gameover';
      if (this.eliminationsPlayerTeam > this.eliminationsAiTeam) this.winner = 'player';
      else if (this.eliminationsAiTeam > this.eliminationsPlayerTeam) this.winner = 'ai';
      else this.winner = 'draw';
      this.audio.playWhistle();
    }
  }

  getSnapshot(): GameSnapshot {
    return {
      players: this.players,
      balls: this.balls,
      powerUps: this.powerUps,
      eliminationsPlayerTeam: this.eliminationsPlayerTeam,
      eliminationsAiTeam: this.eliminationsAiTeam,
      aliveOnPlayerTeam: this.players.filter((p) => p.team === 'player' && p.alive).length,
      aliveOnAiTeam: this.players.filter((p) => p.team === 'ai' && p.alive).length,
      timeRemaining: this.timeRemaining,
      status: this.status,
      winner: this.winner,
      activePowerUp: this.clock < this.hudPowerUpUntil ? this.hudPowerUpType : null,
    };
  }
}

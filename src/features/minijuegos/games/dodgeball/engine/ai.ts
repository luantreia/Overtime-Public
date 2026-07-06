import type { BallEntity, PlayerEntity } from './types';
import { distance, normalize } from '../../../shared/collisions';
import { CATCH_WINDOW_RADIUS, CENTER_LINE_Y } from './constants';

export interface AiIntent {
  moveX: number;
  moveY: number;
  wantThrow: boolean;
  wantCatch: boolean;
}

interface AiContext {
  players: PlayerEntity[];
  balls: BallEntity[];
}

export const findNearestOpponent = (self: PlayerEntity, players: PlayerEntity[]): PlayerEntity | null => {
  let nearest: PlayerEntity | null = null;
  let nearestDist = Infinity;
  for (const p of players) {
    if (p.team === self.team || !p.alive) continue;
    const d = distance(self.position, p.position);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = p;
    }
  }
  return nearest;
};

const findLooseBall = (balls: BallEntity[]): BallEntity | null => balls.find((b) => b.state === 'loose') || null;

const findIncomingBall = (self: PlayerEntity, balls: BallEntity[]): BallEntity | null => {
  return (
    balls.find((b) => {
      if (b.state !== 'flying' || b.thrownBy === self.id) return false;
      const toSelf = { x: self.position.x - b.position.x, y: self.position.y - b.position.y };
      const dist = Math.hypot(toSelf.x, toSelf.y);
      if (dist > CATCH_WINDOW_RADIUS * 2.2) return false;
      const velDir = normalize(b.velocity);
      const toSelfDir = normalize(toSelf);
      const alignment = velDir.x * toSelfDir.x + velDir.y * toSelfDir.y;
      return alignment > 0.6;
    }) || null
  );
};

export const computeAiIntent = (self: PlayerEntity, ctx: AiContext): AiIntent => {
  const incoming = findIncomingBall(self, ctx.balls);
  if (incoming) {
    const dist = distance(self.position, incoming.position);
    if (dist < CATCH_WINDOW_RADIUS) {
      return { moveX: 0, moveY: 0, wantThrow: false, wantCatch: true };
    }
    const away = normalize({ x: self.position.x - incoming.position.x, y: self.position.y - incoming.position.y });
    return { moveX: away.x, moveY: 0, wantThrow: false, wantCatch: false };
  }

  if (self.hasBall) {
    const target = findNearestOpponent(self, ctx.players);
    return { moveX: 0, moveY: 0, wantThrow: !!target, wantCatch: false };
  }

  const loose = findLooseBall(ctx.balls);
  if (loose) {
    const dir = normalize({ x: loose.position.x - self.position.x, y: loose.position.y - self.position.y });
    return { moveX: dir.x, moveY: dir.y, wantThrow: false, wantCatch: false };
  }

  const homeY = self.team === 'ai' ? CENTER_LINE_Y * 0.5 : CENTER_LINE_Y * 1.5;
  const driftY = homeY - self.position.y;
  return {
    moveX: Math.sin(self.animPhase * 0.5 + self.position.x) * 0.3,
    moveY: Math.abs(driftY) > 20 ? Math.sign(driftY) * 0.4 : 0,
    wantThrow: false,
    wantCatch: false,
  };
};

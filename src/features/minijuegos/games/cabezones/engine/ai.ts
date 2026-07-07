import type { CabezonBall, CabezonPlayer, Vector2 } from './types';
import { CATCH_WINDOW_RADIUS, GRAVITY, AI_AIM_ERROR } from './constants';

export interface CabezonesAiIntent {
  moveX: number;
  wantJump: boolean;
  wantCatch: boolean;
  wantThrow: boolean;
  throwVelocity?: Vector2;
  throwSpin?: number;
}

interface AiContext {
  self: CabezonPlayer;
  opponent: CabezonPlayer;
  balls: CabezonBall[];
}

const computeThrowVelocity = (from: Vector2, to: Vector2): Vector2 => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const timeOfFlight = Math.min(1.1, Math.max(0.5, dist / 260));
  const vx = dx / timeOfFlight;
  const vy = (dy - 0.5 * GRAVITY * timeOfFlight * timeOfFlight) / timeOfFlight;
  return { x: vx, y: vy };
};

export const computeCabezonesAiIntent = (ctx: AiContext): CabezonesAiIntent => {
  const { self, opponent, balls } = ctx;

  const towardSelfSign = self.side === 'left' ? -1 : 1;
  const incoming = balls.find(
    (b) =>
      b.state === 'flying' &&
      b.thrownBy !== self.id &&
      b.velocity.x * towardSelfSign > 0 &&
      Math.hypot(b.position.x - self.position.x, b.position.y - self.position.y) < CATCH_WINDOW_RADIUS * 2.5
  );

  if (incoming && !self.hasBallId) {
    const dist = Math.hypot(incoming.position.x - self.position.x, incoming.position.y - self.position.y);
    return {
      moveX: 0,
      wantJump: incoming.velocity.y < -50 && Math.random() < 0.02,
      wantCatch: dist < CATCH_WINDOW_RADIUS,
      wantThrow: false,
    };
  }

  if (self.hasBallId) {
    const targetPos: Vector2 = {
      x: opponent.position.x + (Math.random() - 0.5) * AI_AIM_ERROR,
      y: opponent.position.y + (Math.random() - 0.5) * AI_AIM_ERROR,
    };
    return {
      moveX: 0,
      wantJump: false,
      wantCatch: false,
      wantThrow: true,
      throwVelocity: computeThrowVelocity(self.position, targetPos),
      throwSpin: Math.random() < 0.4 ? (Math.random() - 0.5) * 6 : 0,
    };
  }

  const looseBall = balls.find((b) => b.state === 'loose');
  if (looseBall) {
    const dir = looseBall.position.x > self.position.x ? 1 : -1;
    return { moveX: dir, wantJump: false, wantCatch: false, wantThrow: false };
  }

  return { moveX: 0, wantJump: false, wantCatch: false, wantThrow: false };
};

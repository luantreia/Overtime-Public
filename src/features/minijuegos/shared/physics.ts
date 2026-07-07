import type { Vector2 } from './types';
import { circlesOverlap } from './collisions';

/** Semi-implicit Euler integration with gravity. Mutates position/velocity in place. */
export const integrate = (position: Vector2, velocity: Vector2, gravity: number, dt: number): void => {
  velocity.y += gravity * dt;
  position.x += velocity.x * dt;
  position.y += velocity.y * dt;
};

/** Returns true if the body is resting on/through the ground line this frame. */
export const resolveGroundCollision = (
  position: Vector2,
  velocity: Vector2,
  radius: number,
  groundY: number,
  restitution: number
): boolean => {
  if (position.y + radius >= groundY) {
    position.y = groundY - radius;
    if (velocity.y > 0) {
      velocity.y = -velocity.y * restitution;
    }
    return true;
  }
  return false;
};

export const resolveWallCollision = (
  position: Vector2,
  velocity: Vector2,
  radius: number,
  minX: number,
  maxX: number,
  restitution: number
): void => {
  if (position.x - radius < minX) {
    position.x = minX + radius;
    velocity.x = Math.abs(velocity.x) * restitution;
  } else if (position.x + radius > maxX) {
    position.x = maxX - radius;
    velocity.x = -Math.abs(velocity.x) * restitution;
  }
};

export interface PhysicsBody {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  mass: number;
}

/**
 * Elastic-ish collision response between two circular bodies: separates the
 * overlap and applies an impulse along the collision normal weighted by mass.
 * Returns true if the bodies were overlapping (and were resolved).
 */
export const resolveCircleCollision = (a: PhysicsBody, b: PhysicsBody, restitution: number): boolean => {
  if (!circlesOverlap(a.position, a.radius, b.position, b.radius)) return false;

  const delta = { x: b.position.x - a.position.x, y: b.position.y - a.position.y };
  const dist = Math.hypot(delta.x, delta.y) || 0.0001;
  const normal = { x: delta.x / dist, y: delta.y / dist };

  const overlap = a.radius + b.radius - dist;
  const totalMass = a.mass + b.mass;
  const aPush = overlap * (b.mass / totalMass);
  const bPush = overlap * (a.mass / totalMass);
  a.position.x -= normal.x * aPush;
  a.position.y -= normal.y * aPush;
  b.position.x += normal.x * bPush;
  b.position.y += normal.y * bPush;

  const relVel = { x: b.velocity.x - a.velocity.x, y: b.velocity.y - a.velocity.y };
  const velAlongNormal = relVel.x * normal.x + relVel.y * normal.y;
  if (velAlongNormal > 0) return true;

  const impulseMag = (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
  const impulseX = impulseMag * normal.x;
  const impulseY = impulseMag * normal.y;

  a.velocity.x -= impulseX / a.mass;
  a.velocity.y -= impulseY / a.mass;
  b.velocity.x += impulseX / b.mass;
  b.velocity.y += impulseY / b.mass;

  return true;
};

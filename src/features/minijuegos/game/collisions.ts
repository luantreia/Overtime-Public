import type { Vector2 } from './types';

export const distance = (a: Vector2, b: Vector2): number => Math.hypot(a.x - b.x, a.y - b.y);

export const circlesOverlap = (aPos: Vector2, aRadius: number, bPos: Vector2, bRadius: number): boolean =>
  distance(aPos, bPos) < aRadius + bRadius;

export const normalize = (v: Vector2): Vector2 => {
  const len = Math.hypot(v.x, v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
};

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const clampPositionToBounds = (
  pos: Vector2,
  radius: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): void => {
  pos.x = clamp(pos.x, minX + radius, maxX - radius);
  pos.y = clamp(pos.y, minY + radius, maxY - radius);
};

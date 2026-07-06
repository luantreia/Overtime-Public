import type { PowerUpType } from './types';

export const COURT_WIDTH = 800;
export const COURT_HEIGHT = 500;
export const CENTER_LINE_Y = COURT_HEIGHT / 2;

export const PLAYER_RADIUS = 18;
export const BALL_RADIUS = 8;
export const POWERUP_RADIUS = 16;

export const TEAM_SIZE = 3;
export const MATCH_DURATION = 90;

export const PLAYER_BASE_SPEED = 170;
export const SPEED_BOOST_MULTIPLIER = 1.5;
export const SPEED_BOOST_DURATION = 6;

export const BALL_THROW_SPEED = 430;
export const BALL_THROW_SPEED_POWERED = 620;
export const THROW_COOLDOWN = 0.6;
export const POWERED_THROW_DURATION = 8;

export const CATCH_WINDOW_RADIUS = 90;
export const SHIELD_DURATION = 15;

export const POWERUP_SPAWN_INTERVAL = 15;
export const POWERUP_MAX_ON_COURT = 1;
export const MULTIBALL_DURATION = 10;

export const POWERUP_TYPES: PowerUpType[] = ['speed', 'power', 'shield', 'multiball'];

export const POWERUP_GLYPHS: Record<PowerUpType, string> = {
  speed: '⚡',
  power: '🔥',
  shield: '🛡️',
  multiball: '⚽',
};

export const TEAM_COLORS: Record<'player' | 'ai', { body: string; accent: string }> = {
  player: { body: '#2563eb', accent: '#93c5fd' },
  ai: { body: '#dc2626', accent: '#fca5a5' },
};

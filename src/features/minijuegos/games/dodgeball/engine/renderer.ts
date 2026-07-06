import type { GameSnapshot, PlayerEntity } from './types';
import { COURT_HEIGHT, COURT_WIDTH, CENTER_LINE_Y, POWERUP_GLYPHS, TEAM_COLORS } from './constants';

const drawCourt = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#0f2a1a';
  ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

  ctx.fillStyle = '#16401f';
  ctx.fillRect(8, 8, COURT_WIDTH - 16, COURT_HEIGHT - 16);

  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(0, CENTER_LINE_Y);
  ctx.lineTo(COURT_WIDTH, CENTER_LINE_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, COURT_WIDTH - 8, COURT_HEIGHT - 8);
};

const drawPlayer = (ctx: CanvasRenderingContext2D, player: PlayerEntity) => {
  const { position, radius, animState, animPhase, isUserControlled, team, alive } = player;
  const colors = TEAM_COLORS[team];

  ctx.save();
  ctx.translate(position.x, position.y);

  if (!alive) {
    ctx.globalAlpha = 0.25;
    ctx.rotate(Math.PI / 2);
  }

  const limbSwing = animState === 'run' ? Math.sin(animPhase) * 0.6 : 0;

  // legs
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, radius * 0.3);
  ctx.lineTo(-6 - limbSwing * 8, radius + 10);
  ctx.moveTo(6, radius * 0.3);
  ctx.lineTo(6 + limbSwing * 8, radius + 10);
  ctx.stroke();

  // arms
  const armSwing = animState === 'throw' ? -1.1 : animState === 'catch' ? 0.9 : Math.sin(animPhase + Math.PI) * 0.4;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.6, 0);
  ctx.lineTo(-radius * 0.6 - Math.cos(armSwing) * 14, -Math.sin(armSwing) * 14);
  ctx.moveTo(radius * 0.6, 0);
  ctx.lineTo(radius * 0.6 + Math.cos(armSwing) * 14, -Math.sin(armSwing) * 14);
  ctx.stroke();

  // body
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.15, radius * 0.55, radius * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.arc(0, -radius * 0.55, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  if (player.shieldActive) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (isUserControlled && alive) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
};

export const renderGame = (ctx: CanvasRenderingContext2D, snapshot: GameSnapshot) => {
  drawCourt(ctx);

  for (const powerUp of snapshot.powerUps) {
    ctx.save();
    ctx.translate(powerUp.position.x, powerUp.position.y);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${powerUp.radius * 1.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(POWERUP_GLYPHS[powerUp.type], 0, 1);
    ctx.restore();
  }

  for (const player of snapshot.players) {
    drawPlayer(ctx, player);
  }

  for (const ball of snapshot.balls) {
    ctx.save();
    ctx.translate(ball.position.x, ball.position.y);
    ctx.fillStyle = ball.powered ? '#f97316' : '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.restore();
  }
};

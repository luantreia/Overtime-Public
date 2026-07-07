import type { CabezonBall, CabezonPlayer, CabezonesSnapshot, Vector2 } from './types';
import { COURT_WIDTH, COURT_HEIGHT, GROUND_Y, CENTER_X } from './constants';

const drawCourt = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, GROUND_Y, COURT_WIDTH, COURT_HEIGHT - GROUND_Y);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(CENTER_X, GROUND_Y);
  ctx.lineTo(CENTER_X, 0);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawPlayer = (ctx: CanvasRenderingContext2D, player: CabezonPlayer) => {
  const flashHit = player.invulnerableUntil > 0;
  ctx.save();
  ctx.translate(player.position.x, player.position.y);

  const bodyColor = player.side === 'left' ? '#2563eb' : '#dc2626';

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, player.radius * 0.55, player.radius * 0.5, player.radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();

  if (flashHit) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (player.isUserControlled) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
};

const drawBall = (ctx: CanvasRenderingContext2D, ball: CabezonBall) => {
  ctx.save();
  ctx.translate(ball.position.x, ball.position.y);
  ctx.rotate(ball.rotation);

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-ball.radius, 0);
  ctx.lineTo(ball.radius, 0);
  ctx.moveTo(0, -ball.radius);
  ctx.lineTo(0, ball.radius);
  ctx.stroke();

  ctx.restore();
};

const drawAimPreview = (ctx: CanvasRenderingContext2D, points: Vector2[]) => {
  ctx.save();
  ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
  points.forEach((p, i) => {
    if (i % 2 !== 0) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

export const renderGame = (ctx: CanvasRenderingContext2D, snapshot: CabezonesSnapshot, aimPreview?: Vector2[] | null) => {
  drawCourt(ctx);

  for (const player of snapshot.players) {
    drawPlayer(ctx, player);
  }

  for (const ball of snapshot.balls) {
    drawBall(ctx, ball);
  }

  if (aimPreview && aimPreview.length > 0) {
    drawAimPreview(ctx, aimPreview);
  }
};

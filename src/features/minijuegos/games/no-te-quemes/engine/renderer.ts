import type { NoTeQuemesSnapshot } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LANES, LANE_WIDTH, PLAYER_Y, PLAYER_RADIUS, BALL_RADIUS } from './constants';

const laneCenterX = (lane: number) => LANE_WIDTH * lane + LANE_WIDTH / 2;

export const renderGame = (ctx: CanvasRenderingContext2D, snapshot: NoTeQuemesSnapshot) => {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  for (let i = 1; i < LANES; i += 1) {
    ctx.beginPath();
    ctx.moveTo(LANE_WIDTH * i, 0);
    ctx.lineTo(LANE_WIDTH * i, CANVAS_HEIGHT);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(laneCenterX(snapshot.playerLane), PLAYER_Y);
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `${PLAYER_RADIUS}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🤾', 0, 2);
  ctx.restore();

  for (const ball of snapshot.balls) {
    ctx.save();
    ctx.translate(laneCenterX(ball.lane), ball.y);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_RADIUS, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.restore();
  }
};

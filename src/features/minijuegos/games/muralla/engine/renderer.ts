import type { MurallaSnapshot, TipoAviso } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_X,
  PLAYER_Y,
  PLAYER_RADIUS,
  BALL_RADIUS,
  RADIO_ACCION,
} from './constants';

const TEXTO_AVISO: Record<TipoAviso, { texto: string; color: string }> = {
  bloqueo: { texto: '¡BLOQUEO!', color: '#4ade80' },
  esquive: { texto: 'esquivada', color: '#7dd3fc' },
  golpe: { texto: 'TE PEGÓ', color: '#f87171' },
  'bloqueo-ilegal': { texto: 'NO SE PUEDE BLOQUEAR', color: '#fb923c' },
  tarde: { texto: 'TARDE', color: '#f87171' },
};

export const renderGame = (ctx: CanvasRenderingContext2D, snapshot: MurallaSnapshot) => {
  const noBlocking = snapshot.fase === 'no-blocking';

  ctx.fillStyle = noBlocking ? '#1c1117' : '#0f172a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // En No-Blocking toda la cancha se tiñe: la fase tiene que leerse sin mirar el HUD.
  if (noBlocking) {
    ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.fillStyle = noBlocking ? 'rgba(249, 115, 22, 0.12)' : 'rgba(37, 99, 235, 0.10)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 90);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(CANVAS_WIDTH, 90);
  ctx.stroke();

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = noBlocking ? 'rgba(251, 146, 60, 0.35)' : 'rgba(74, 222, 128, 0.32)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(PLAYER_X, PLAYER_Y, RADIO_ACCION, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const tiro of snapshot.tiros) {
    ctx.save();
    ctx.translate(tiro.x, tiro.y);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_RADIUS, 0.4, Math.PI - 0.4);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(PLAYER_X, PLAYER_Y);
  const bloqueando = snapshot.gesto?.accion === 'bloquear';
  const esquivando = snapshot.gesto?.accion === 'esquivar';
  if (esquivando) ctx.translate(18, 0);

  ctx.fillStyle = noBlocking ? '#9a3412' : '#2563eb';
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `${PLAYER_RADIUS + 4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(esquivando ? '💨' : '🧍', 0, 2);

  // La pelota en la mano: es lo que bloquea en fase normal y lo que te condena en No-Blocking.
  ctx.translate(0, -PLAYER_RADIUS - (bloqueando ? 20 : 8));
  ctx.fillStyle = noBlocking ? '#ef4444' : '#f97316';
  ctx.beginPath();
  ctx.arc(0, 0, BALL_RADIUS - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (snapshot.aviso) {
    const { texto, color } = TEXTO_AVISO[snapshot.aviso.tipo];
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - snapshot.aviso.edad / 0.6);
    ctx.fillStyle = color;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(texto, CANVAS_WIDTH / 2, PLAYER_Y - 104);
    ctx.restore();
  }

  if (snapshot.anuncio > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 66, CANVAS_WIDTH, 132);
    ctx.textAlign = 'center';
    ctx.fillStyle = noBlocking ? '#fb923c' : '#4ade80';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(noBlocking ? 'NO-BLOCKING' : 'BLOQUEO OK', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '15px sans-serif';
    ctx.fillText(
      noBlocking ? 'La pelota cuenta como tu cuerpo' : 'Volvés a poder frenar con la pelota',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 14
    );
    ctx.fillStyle = noBlocking ? '#fdba74' : '#86efac';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(noBlocking ? 'SOLO ESQUIVAR →' : '← BLOQUEAR de nuevo', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    ctx.restore();
  }

  // Pie con el reparto de las dos mitades táctiles.
  const altoPie = 46;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(0, CANVAS_HEIGHT - altoPie, CANVAS_WIDTH, altoPie);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - altoPie);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = noBlocking ? '#7f1d1d' : '#4ade80';
  ctx.fillText('🛡️ BLOQUEAR', CANVAS_WIDTH / 4, CANVAS_HEIGHT - altoPie / 2 + 5);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText('💨 ESQUIVAR', (CANVAS_WIDTH * 3) / 4, CANVAS_HEIGHT - altoPie / 2 + 5);

  if (snapshot.combo >= 2) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x${Math.min(5, snapshot.combo)}`, CANVAS_WIDTH / 2, PLAYER_Y + PLAYER_RADIUS + 32);
  }
};

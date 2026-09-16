import type { ManosSnapshot, TipoAviso } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_X,
  PLAYER_Y,
  PLAYER_RADIUS,
  BALL_RADIUS,
  RADIO_ATAJADA,
  RADIO_PERFECTO,
  CASTIGO_MANOTAZO,
} from './constants';

const TEXTO_AVISO: Record<TipoAviso, { texto: string; color: string }> = {
  perfecta: { texto: '¡ATAJADA PERFECTA!', color: '#fbbf24' },
  atajada: { texto: '¡ATAJADA!', color: '#4ade80' },
  golpe: { texto: 'TE PEGÓ', color: '#f87171' },
  manotazo: { texto: 'YA HABÍA PICADO', color: '#fb923c' },
  'dejaste-pasar': { texto: 'bien dejada', color: '#94a3b8' },
};

export const renderGame = (ctx: CanvasRenderingContext2D, snapshot: ManosSnapshot) => {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Media cancha rival arriba, para que se entienda de dónde vienen los tiros.
  ctx.fillStyle = 'rgba(37, 99, 235, 0.10)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 90);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(CANVAS_WIDTH, 90);
  ctx.stroke();

  const sinManos = snapshot.castigo > 0;

  // Anillos de atajada: el externo marca la ventana, el interno la perfecta.
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = sinManos ? 'rgba(248, 113, 113, 0.35)' : 'rgba(74, 222, 128, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(PLAYER_X, PLAYER_Y, RADIO_ATAJADA, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = sinManos ? 'rgba(248, 113, 113, 0.5)' : 'rgba(251, 191, 36, 0.55)';
  ctx.beginPath();
  ctx.arc(PLAYER_X, PLAYER_Y, RADIO_PERFECTO, 0, Math.PI * 2);
  ctx.stroke();

  for (const tiro of snapshot.tiros) {
    ctx.save();
    ctx.translate(tiro.x, tiro.y);
    if (tiro.viva) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS, 0.4, Math.PI - 0.4);
      ctx.stroke();
    } else {
      // Picada: apagada y con contorno punteado. Es la señal de "no la toques".
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(PLAYER_X, PLAYER_Y);
  ctx.fillStyle = sinManos ? '#7f1d1d' : '#2563eb';
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `${PLAYER_RADIUS + 4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sinManos ? '😖' : '🧤', 0, 2);
  ctx.restore();

  if (sinManos) {
    // Arco que se vacía: cuánto falta para recuperar las manos.
    const resto = snapshot.castigo / CASTIGO_MANOTAZO;
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(PLAYER_X, PLAYER_Y, PLAYER_RADIUS + 9, -Math.PI / 2, -Math.PI / 2 + resto * Math.PI * 2);
    ctx.stroke();
  }

  if (snapshot.aviso) {
    const { texto, color } = TEXTO_AVISO[snapshot.aviso.tipo];
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - snapshot.aviso.edad / 0.6);
    ctx.fillStyle = color;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(texto, CANVAS_WIDTH / 2, PLAYER_Y - 96);
    ctx.restore();
  }

  if (snapshot.combo >= 2) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x${Math.min(5, snapshot.combo)}`, CANVAS_WIDTH / 2, PLAYER_Y + PLAYER_RADIUS + 34);
  }
};

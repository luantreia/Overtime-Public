import type { ArrancadaSnapshot, TipoAviso } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LINEA_MEDIO,
  LINEA_ACTIVACION,
  LINEA_FONDO,
  PLAYER_RADIUS,
  BALL_RADIUS,
  RIVAL_RADIUS,
} from './constants';

const TEXTO_AVISO: Record<TipoAviso, { texto: string; color: string }> = {
  activada: { texto: '¡ACTIVADA! +100', color: '#4ade80' },
  levantada: { texto: 'volvé a cruzar tu línea', color: '#fbbf24' },
  golpe: { texto: 'TE PEGARON', color: '#f87171' },
  'sin-activar': { texto: 'LA PERDISTE SIN ACTIVAR', color: '#fb923c' },
};

export const renderGame = (ctx: CanvasRenderingContext2D, snapshot: ArrancadaSnapshot) => {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(37, 99, 235, 0.10)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, LINEA_MEDIO);
  ctx.fillStyle = 'rgba(220, 38, 38, 0.08)';
  ctx.fillRect(0, LINEA_MEDIO, CANVAS_WIDTH, LINEA_FONDO - LINEA_MEDIO);

  // Zona segura: detrás de la línea de activación la pelota ya cuenta.
  ctx.fillStyle = 'rgba(74, 222, 128, 0.10)';
  ctx.fillRect(0, LINEA_ACTIVACION, CANVAS_WIDTH, LINEA_FONDO - LINEA_ACTIVACION);

  const linea = (y: number, color: string, ancho: number, guion?: number[]) => {
    ctx.save();
    if (guion) ctx.setLineDash(guion);
    ctx.strokeStyle = color;
    ctx.lineWidth = ancho;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
    ctx.restore();
  };

  linea(LINEA_MEDIO, '#312e81', 4);
  linea(LINEA_ACTIVACION, snapshot.llevaPelota ? '#4ade80' : 'rgba(74, 222, 128, 0.45)', 3, [8, 6]);
  linea(LINEA_FONDO, 'rgba(148, 163, 184, 0.5)', 2);

  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
  ctx.fillText('línea del medio', 8, LINEA_MEDIO - 6);
  ctx.fillStyle = snapshot.llevaPelota ? '#86efac' : 'rgba(134, 239, 172, 0.7)';
  ctx.fillText('línea de activación', 8, LINEA_ACTIVACION - 6);

  for (const pelota of snapshot.pelotas) {
    if (!pelota.disponible) continue;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(pelota.x, pelota.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const rival of snapshot.rivales) {
    ctx.save();
    ctx.translate(rival.x, rival.y);
    ctx.fillStyle = rival.estado === 'armado' ? '#1d4ed8' : '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, 0, RIVAL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    if (rival.estado === 'armado') {
      // Anillo de aviso: este ya activó y está por tirarte.
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, RIVAL_RADIUS + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const tiro of snapshot.tiros) {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(tiro.x, tiro.y, BALL_RADIUS - 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(snapshot.jugador.x, snapshot.jugador.y);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  if (snapshot.llevaPelota) {
    // La pelota va amarilla —sin activar— hasta que cruza la línea.
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, -PLAYER_RADIUS - 6, BALL_RADIUS - 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (snapshot.aviso) {
    const { texto, color } = TEXTO_AVISO[snapshot.aviso.tipo];
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - snapshot.aviso.edad / 0.6);
    ctx.fillStyle = color;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(texto, CANVAS_WIDTH / 2, LINEA_MEDIO + 34);
    ctx.restore();
  }
};

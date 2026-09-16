import type { JuntaSnapshot, TipoAviso } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CANCHA_TOP,
  CANCHA_BOTTOM,
  PASILLO_Y,
  SHAGGER_RADIUS,
  LINEA_MEDIO_X,
  LINEA_ATAQUE_X,
  BALL_RADIUS,
  CAPACIDAD,
  SUMINISTRO_MAX,
} from './constants';

const TEXTO_AVISO: Record<TipoAviso, { texto: string; color: string }> = {
  juntada: { texto: 'juntada', color: '#7dd3fc' },
  llena: { texto: 'carga llena — llevala', color: '#fbbf24' },
  entrega: { texto: '¡DEVUELTA!', color: '#4ade80' },
  'carga-llena': { texto: '¡DOBLE! +bonus', color: '#fbbf24' },
  tope: { texto: 'no podés pasar el medio', color: '#fb923c' },
};

export const renderGame = (ctx: CanvasRenderingContext2D, snapshot: JuntaSnapshot) => {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // La cancha, abajo: no la pisás nunca, pero se ve de dónde salen las pelotas.
  ctx.fillStyle = 'rgba(220, 38, 38, 0.10)';
  ctx.fillRect(0, CANCHA_TOP, LINEA_MEDIO_X, CANCHA_BOTTOM - CANCHA_TOP);
  ctx.fillStyle = 'rgba(37, 99, 235, 0.10)';
  ctx.fillRect(LINEA_MEDIO_X, CANCHA_TOP, CANVAS_WIDTH - LINEA_MEDIO_X, CANCHA_BOTTOM - CANCHA_TOP);

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, CANCHA_TOP, CANVAS_WIDTH, CANCHA_BOTTOM - CANCHA_TOP);

  // Línea del medio: tu tope duro, cruza todo el alto para que se lea como un muro.
  ctx.strokeStyle = '#312e81';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(LINEA_MEDIO_X, 0);
  ctx.lineTo(LINEA_MEDIO_X, CANCHA_BOTTOM);
  ctx.stroke();

  // Zona de devolución, detrás de tu línea de ataque.
  ctx.fillStyle = 'rgba(74, 222, 128, 0.14)';
  ctx.fillRect(0, 0, LINEA_ATAQUE_X, CANCHA_TOP);
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = snapshot.carga > 0 ? '#4ade80' : 'rgba(74, 222, 128, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(LINEA_ATAQUE_X, 0);
  ctx.lineTo(LINEA_ATAQUE_X, CANCHA_BOTTOM);
  ctx.stroke();
  ctx.restore();

  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = snapshot.carga > 0 ? '#86efac' : 'rgba(134, 239, 172, 0.7)';
  ctx.fillText('devolver acá', LINEA_ATAQUE_X / 2, 18);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
  ctx.save();
  ctx.translate(LINEA_MEDIO_X + 14, CANCHA_TOP / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('línea del medio', 0, 0);
  ctx.restore();

  for (const pelota of snapshot.pelotas) {
    ctx.save();
    ctx.translate(pelota.x, pelota.y);
    ctx.fillStyle = pelota.alcanzable ? '#f97316' : '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    if (!pelota.alcanzable) {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(snapshot.shaggerX, PASILLO_Y);
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.arc(0, 0, SHAGGER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `${SHAGGER_RADIUS + 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧺', 0, 1);
  ctx.restore();

  // Las pelotas que lleva encima, apiladas sobre la cabeza.
  for (let i = 0; i < snapshot.carga; i += 1) {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(snapshot.shaggerX, PASILLO_Y - SHAGGER_RADIUS - 9 - i * (BALL_RADIUS * 1.7), BALL_RADIUS - 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Barra de suministro del equipo: si llega a cero, se acabó.
  const ancho = CANVAS_WIDTH - 32;
  const proporcion = snapshot.suministro / SUMINISTRO_MAX;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.fillRect(16, CANVAS_HEIGHT - 24, ancho, 12);
  ctx.fillStyle = proporcion > 0.5 ? '#4ade80' : proporcion > 0.22 ? '#fbbf24' : '#f87171';
  ctx.fillRect(16, CANVAS_HEIGHT - 24, ancho * proporcion, 12);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SUMINISTRO DEL EQUIPO', 16, CANVAS_HEIGHT - 30);

  if (snapshot.aviso) {
    const { texto, color } = TEXTO_AVISO[snapshot.aviso.tipo];
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - snapshot.aviso.edad / 0.6);
    ctx.fillStyle = color;
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(texto, CANVAS_WIDTH / 2, PASILLO_Y - 46);
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`carga ${snapshot.carga}/${CAPACIDAD}`, CANVAS_WIDTH - 16, CANVAS_HEIGHT - 30);
};

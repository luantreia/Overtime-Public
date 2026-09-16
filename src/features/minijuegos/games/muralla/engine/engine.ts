import type { GameStatus } from '../../../shared/types';
import type { GameAudio } from '../../../shared/audio';
import { readHighScore, writeHighScore } from '../../../shared/highScore';
import type { Accion, Aviso, Fase, MurallaSnapshot, TiroMuralla } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_X,
  PLAYER_Y,
  PLAYER_RADIUS,
  BALL_RADIUS,
  RADIO_ACCION,
  VIDAS_INICIALES,
  VELOCIDAD_INICIAL,
  VELOCIDAD_MAX,
  RAMPA_VELOCIDAD,
  INTERVALO_INICIAL,
  INTERVALO_MIN,
  RAMPA_INTERVALO,
  TIROS_FASE_NORMAL,
  TIROS_FASE_NO_BLOCKING,
  PAUSA_CAMBIO_FASE,
  PUNTOS_BLOQUEO,
  PUNTOS_ESQUIVE,
  HIGH_SCORE_KEY,
} from './constants';

const MAX_DT = 0.05;
const DURACION_AVISO = 0.6;
const DURACION_GESTO = 0.25;

const tirosDeFase = (fase: Fase) => (fase === 'normal' ? TIROS_FASE_NORMAL : TIROS_FASE_NO_BLOCKING);

/**
 * El mismo par de botones cambia de significado a mitad del set. Con bloqueo habilitado conviene
 * bloquear (paga más y conservás la pelota); cuando el árbitro canta No-Blocking, la pelota en la
 * mano pasa a contar como el cuerpo y ese mismo botón te elimina. Esquivar siempre es legal, pero
 * paga menos: el juego es resistir la costumbre que acabás de agarrar.
 */
export class MurallaEngine {
  status: GameStatus = 'ready';
  fase: Fase = 'normal';
  tiros: TiroMuralla[] = [];
  vidas = VIDAS_INICIALES;
  combo = 0;
  mejorCombo = 0;
  bloqueos = 0;
  puntos = 0;
  highScore = readHighScore(HIGH_SCORE_KEY);
  isNewHighScore = false;

  private transcurrido = 0;
  private nextId = 0;
  private spawnTimer = 0.9;
  private tirosLanzadosEnFase = 0;
  private anuncio = 0;
  private gesto: { accion: Accion; edad: number } | null = null;
  private aviso: Aviso | null = null;
  private accionPendiente: Accion | null = null;

  constructor(private audio: GameAudio) {}

  private genId(): string {
    this.nextId += 1;
    return `m${this.nextId}`;
  }

  reset() {
    this.status = 'ready';
    this.fase = 'normal';
    this.tiros = [];
    this.vidas = VIDAS_INICIALES;
    this.combo = 0;
    this.mejorCombo = 0;
    this.bloqueos = 0;
    this.puntos = 0;
    this.transcurrido = 0;
    this.spawnTimer = 0.9;
    this.tirosLanzadosEnFase = 0;
    this.anuncio = 0;
    this.gesto = null;
    this.aviso = null;
    this.accionPendiente = null;
    this.isNewHighScore = false;
  }

  start() {
    this.reset();
    this.status = 'playing';
    this.audio.playWhistle();
  }

  requestAccion(accion: Accion) {
    this.accionPendiente = accion;
  }

  private mostrar(tipo: Aviso['tipo']) {
    this.aviso = { tipo, edad: 0 };
  }

  private lanzarTiro() {
    const origenX = BALL_RADIUS + Math.random() * (CANVAS_WIDTH - BALL_RADIUS * 2);
    const dx = PLAYER_X - origenX;
    const dy = PLAYER_Y + BALL_RADIUS;
    const largo = Math.hypot(dx, dy) || 1;
    const velocidad = Math.min(VELOCIDAD_MAX, VELOCIDAD_INICIAL + this.transcurrido * RAMPA_VELOCIDAD);

    this.tiros.push({
      id: this.genId(),
      x: origenX,
      y: -BALL_RADIUS,
      vx: (dx / largo) * velocidad,
      vy: (dy / largo) * velocidad,
    });
    this.tirosLanzadosEnFase += 1;
  }

  private cambiarFase() {
    this.fase = this.fase === 'normal' ? 'no-blocking' : 'normal';
    this.tirosLanzadosEnFase = 0;
    this.anuncio = PAUSA_CAMBIO_FASE;
    this.audio.playWhistle();
  }

  private distancia(tiro: TiroMuralla): number {
    return Math.hypot(tiro.x - PLAYER_X, tiro.y - PLAYER_Y);
  }

  private tiroEnVentana(): TiroMuralla | null {
    let mejor: TiroMuralla | null = null;
    let mejorDist = Infinity;
    for (const tiro of this.tiros) {
      const d = this.distancia(tiro);
      if (d <= RADIO_ACCION && d < mejorDist) {
        mejor = tiro;
        mejorDist = d;
      }
    }
    return mejor;
  }

  private resolverAccion(accion: Accion) {
    this.gesto = { accion, edad: 0 };

    // Bloquear en No-Blocking elimina aunque no venga ninguna pelota cerca: el gesto ya es la
    // infracción. Esquivar al aire, en cambio, solo corta la racha.
    const objetivo = this.tiroEnVentana();
    if (!objetivo) {
      if (accion === 'bloquear' && this.fase === 'no-blocking') {
        this.penalizar('bloqueo-ilegal');
        return;
      }
      this.combo = 0;
      return;
    }

    this.tiros = this.tiros.filter((t) => t.id !== objetivo.id);

    if (accion === 'bloquear') {
      if (this.fase === 'no-blocking') {
        this.penalizar('bloqueo-ilegal');
        return;
      }
      this.bloqueos += 1;
      this.sumar(PUNTOS_BLOQUEO, 'bloqueo');
      this.audio.playCatch();
      return;
    }

    this.sumar(PUNTOS_ESQUIVE, 'esquive');
    this.audio.playThrow();
  }

  private sumar(base: number, aviso: Aviso['tipo']) {
    this.combo += 1;
    this.mejorCombo = Math.max(this.mejorCombo, this.combo);
    this.puntos += base * Math.min(5, this.combo);
    this.mostrar(aviso);
  }

  private penalizar(aviso: Aviso['tipo']) {
    this.vidas -= 1;
    this.combo = 0;
    this.mostrar(aviso);
    this.audio.playEliminate();
    if (this.vidas <= 0) this.terminar();
  }

  update(dtSeconds: number) {
    if (this.status !== 'playing') return;
    const dt = Math.min(dtSeconds, MAX_DT);
    this.transcurrido += dt;

    if (this.aviso) {
      this.aviso.edad += dt;
      if (this.aviso.edad > DURACION_AVISO) this.aviso = null;
    }
    if (this.gesto) {
      this.gesto.edad += dt;
      if (this.gesto.edad > DURACION_GESTO) this.gesto = null;
    }

    if (this.accionPendiente) {
      const accion = this.accionPendiente;
      this.accionPendiente = null;
      this.resolverAccion(accion);
      if (this.status !== 'playing') return;
    }

    if (this.anuncio > 0) {
      // Durante el cartel no entran tiros nuevos, pero los que ya están en el aire siguen.
      this.anuncio = Math.max(0, this.anuncio - dt);
    } else if (this.tirosLanzadosEnFase >= tirosDeFase(this.fase) && this.tiros.length === 0) {
      this.cambiarFase();
    } else if (this.tirosLanzadosEnFase < tirosDeFase(this.fase)) {
      const intervalo = Math.max(INTERVALO_MIN, INTERVALO_INICIAL - this.transcurrido * RAMPA_INTERVALO);
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = intervalo;
        this.lanzarTiro();
      }
    }

    for (const tiro of this.tiros) {
      tiro.x += tiro.vx * dt;
      tiro.y += tiro.vy * dt;
    }

    const siguen: TiroMuralla[] = [];
    for (const tiro of this.tiros) {
      if (this.distancia(tiro) < PLAYER_RADIUS + BALL_RADIUS) {
        this.penalizar('golpe');
        if (this.status !== 'playing') return;
        continue;
      }
      if (tiro.y - BALL_RADIUS <= CANVAS_HEIGHT + 40) siguen.push(tiro);
    }
    this.tiros = siguen;
  }

  private terminar() {
    this.status = 'gameover';
    if (this.puntos > this.highScore) {
      this.highScore = this.puntos;
      this.isNewHighScore = true;
      writeHighScore(HIGH_SCORE_KEY, this.puntos);
    }
    this.audio.playWhistle();
  }

  getSnapshot(): MurallaSnapshot {
    return {
      status: this.status,
      fase: this.fase,
      tiros: this.tiros,
      vidas: this.vidas,
      score: this.puntos,
      highScore: this.highScore,
      combo: this.combo,
      mejorCombo: this.mejorCombo,
      bloqueos: this.bloqueos,
      tirosRestantesFase: Math.max(0, tirosDeFase(this.fase) - this.tirosLanzadosEnFase),
      anuncio: this.anuncio,
      gesto: this.gesto,
      aviso: this.aviso,
    };
  }
}

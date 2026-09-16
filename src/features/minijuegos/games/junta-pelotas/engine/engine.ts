import type { GameStatus } from '../../../shared/types';
import type { GameAudio } from '../../../shared/audio';
import { clamp } from '../../../shared/collisions';
import { readHighScore, writeHighScore } from '../../../shared/highScore';
import type { Aviso, JuntaSnapshot, PelotaAfuera } from './types';
import {
  CANVAS_WIDTH,
  CANCHA_TOP,
  PASILLO_Y,
  SHAGGER_RADIUS,
  SHAGGER_SPEED,
  LINEA_MEDIO_X,
  LINEA_ATAQUE_X,
  BALL_RADIUS,
  CAPACIDAD,
  SUMINISTRO_MAX,
  SUMINISTRO_DRENAJE,
  SUMINISTRO_POR_PELOTA,
  INTERVALO_SALIDA_INICIAL,
  INTERVALO_SALIDA_MIN,
  RAMPA_SALIDA,
  PUNTOS_POR_PELOTA,
  BONUS_CARGA_LLENA,
  PUNTOS_POR_SEGUNDO,
  HIGH_SCORE_KEY,
} from './constants';

const MAX_DT = 0.05;
const DURACION_AVISO = 0.6;
const VELOCIDAD_SALIDA = 90;

/**
 * El shagger: el rol que nadie mira pero sin el cual el set se frena. Tres restricciones reales
 * lo vuelven un juego de logística en vez de una recolección cualquiera — trabajás solo por
 * fuera de las líneas, no podés pasar la línea del medio, y la pelota se devuelve por detrás de
 * tu propia línea de ataque. La presión la pone el suministro, que baja solo.
 */
export class JuntaPelotasEngine {
  status: GameStatus = 'ready';
  shaggerX = LINEA_ATAQUE_X;
  carga = 0;
  pelotas: PelotaAfuera[] = [];
  suministro = SUMINISTRO_MAX;
  entregadas = 0;
  puntos = 0;
  segundos = 0;
  highScore = readHighScore(HIGH_SCORE_KEY);
  isNewHighScore = false;

  private nextId = 0;
  private puntosFraccion = 0;
  private salidaTimer = 1.0;
  private aviso: Aviso | null = null;
  private destinoX: number | null = null;
  private topeAvisado = false;

  constructor(private audio: GameAudio) {}

  private genId(): string {
    this.nextId += 1;
    return `j${this.nextId}`;
  }

  reset() {
    this.status = 'ready';
    this.shaggerX = LINEA_ATAQUE_X;
    this.carga = 0;
    this.pelotas = [];
    this.suministro = SUMINISTRO_MAX;
    this.entregadas = 0;
    this.puntos = 0;
    this.segundos = 0;
    this.puntosFraccion = 0;
    this.salidaTimer = 1.0;
    this.aviso = null;
    this.destinoX = null;
    this.topeAvisado = false;
    this.isNewHighScore = false;
  }

  start() {
    this.reset();
    this.status = 'playing';
    this.audio.playWhistle();
  }

  /** X del canvas al que camina el shagger. null = quieto. */
  setDestinoX(x: number | null) {
    this.destinoX = x;
  }

  private mostrar(tipo: Aviso['tipo']) {
    this.aviso = { tipo, edad: 0 };
  }

  private sacarPelota() {
    // Sale de cualquier punto a lo ancho. Las que caen del lado del rival quedan fuera de tu
    // alcance: están ahí para que se vea el límite, no para juntarlas.
    const x = BALL_RADIUS + Math.random() * (CANVAS_WIDTH - BALL_RADIUS * 2);
    this.pelotas.push({
      id: this.genId(),
      x,
      y: CANCHA_TOP + 26,
      yDestino: PASILLO_Y,
      alcanzable: x <= LINEA_MEDIO_X,
    });
  }

  private moverShagger(dt: number) {
    if (this.destinoX === null) return;
    const dx = this.destinoX - this.shaggerX;
    if (Math.abs(dx) < 2) return;
    const paso = Math.min(Math.abs(dx), SHAGGER_SPEED * dt);
    this.shaggerX += Math.sign(dx) * paso;

    const tope = LINEA_MEDIO_X - SHAGGER_RADIUS;
    if (this.shaggerX >= tope) {
      this.shaggerX = tope;
      if (!this.topeAvisado) {
        this.topeAvisado = true;
        this.mostrar('tope');
      }
    } else if (this.shaggerX < tope - 6) {
      this.topeAvisado = false;
    }
    this.shaggerX = clamp(this.shaggerX, SHAGGER_RADIUS, tope);
  }

  private juntar() {
    if (this.carga >= CAPACIDAD) return;
    const quedan: PelotaAfuera[] = [];
    for (const pelota of this.pelotas) {
      const enElPasillo = Math.abs(pelota.y - PASILLO_Y) < 4;
      const alAlcance = Math.abs(pelota.x - this.shaggerX) < SHAGGER_RADIUS + BALL_RADIUS;
      if (pelota.alcanzable && enElPasillo && alAlcance && this.carga < CAPACIDAD) {
        this.carga += 1;
        this.mostrar(this.carga >= CAPACIDAD ? 'llena' : 'juntada');
        this.audio.playPowerUp();
        continue;
      }
      quedan.push(pelota);
    }
    this.pelotas = quedan;
  }

  private entregar() {
    if (this.carga === 0) return;
    if (this.shaggerX > LINEA_ATAQUE_X) return;

    const llena = this.carga >= CAPACIDAD;
    this.puntos += PUNTOS_POR_PELOTA * this.carga + (llena ? BONUS_CARGA_LLENA : 0);
    this.suministro = Math.min(SUMINISTRO_MAX, this.suministro + SUMINISTRO_POR_PELOTA * this.carga);
    this.entregadas += this.carga;
    this.carga = 0;
    this.mostrar(llena ? 'carga-llena' : 'entrega');
    this.audio.playCatch();
  }

  update(dtSeconds: number) {
    if (this.status !== 'playing') return;
    const dt = Math.min(dtSeconds, MAX_DT);
    this.segundos += dt;

    if (this.aviso) {
      this.aviso.edad += dt;
      if (this.aviso.edad > DURACION_AVISO) this.aviso = null;
    }

    this.suministro = Math.max(0, this.suministro - SUMINISTRO_DRENAJE * dt);

    const intervalo = Math.max(INTERVALO_SALIDA_MIN, INTERVALO_SALIDA_INICIAL - this.segundos * RAMPA_SALIDA);
    this.salidaTimer -= dt;
    if (this.salidaTimer <= 0) {
      this.salidaTimer = intervalo;
      this.sacarPelota();
    }

    for (const pelota of this.pelotas) {
      if (pelota.y > pelota.yDestino) {
        pelota.y = Math.max(pelota.yDestino, pelota.y - VELOCIDAD_SALIDA * dt);
      }
    }

    this.moverShagger(dt);
    this.juntar();
    this.entregar();

    // Sobrevivir también suma. Va por un acumulador en decimales porque a 60 fps cada frame
    // aporta ~0.16 puntos: redondeado frame a frame daba siempre 0 y el puntaje por aguantar
    // no existía.
    this.puntosFraccion += dt * PUNTOS_POR_SEGUNDO;
    const enteros = Math.floor(this.puntosFraccion);
    if (enteros > 0) {
      this.puntos += enteros;
      this.puntosFraccion -= enteros;
    }

    if (this.suministro <= 0) this.terminar();
  }

  private terminar() {
    this.status = 'gameover';
    if (this.puntos > this.highScore) {
      this.highScore = this.puntos;
      this.isNewHighScore = true;
      writeHighScore(HIGH_SCORE_KEY, this.puntos);
    }
    this.audio.playEliminate();
    this.audio.playWhistle();
  }

  getSnapshot(): JuntaSnapshot {
    return {
      status: this.status,
      shaggerX: this.shaggerX,
      carga: this.carga,
      pelotas: this.pelotas,
      suministro: this.suministro,
      score: this.puntos,
      highScore: this.highScore,
      entregadas: this.entregadas,
      segundos: this.segundos,
      aviso: this.aviso,
    };
  }
}

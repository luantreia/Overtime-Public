import type { GameStatus } from '../../../shared/types';
import type { GameAudio } from '../../../shared/audio';
import { readHighScore, writeHighScore } from '../../../shared/highScore';
import type { OutONoSnapshot, Respuesta, Situacion } from './types';
import { SITUACIONES } from './situaciones';
import {
  JUGADAS_POR_PARTIDA,
  SEGUNDOS_POR_JUGADA,
  SEGUNDOS_DEVOLUCION,
  PUNTOS_BASE,
  PUNTOS_POR_VELOCIDAD,
  TOPE_RACHA,
  HIGH_SCORE_KEY,
} from './constants';

const MAX_DT = 0.05;

/** Fisher-Yates sobre una copia: el banco original no se toca. */
const mezclar = <T,>(items: T[]): T[] => {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

/**
 * El único de los cinco sin canvas: acá el juego es decidir, no ejecutar. Te muestra una jugada
 * y tenés que fallarla como árbitro antes de que se acabe el reloj. Cada respuesta viene con la
 * regla que la resuelve, así que la partida deja algo incluso cuando errás.
 */
export class OutONoEngine {
  status: GameStatus = 'ready';
  ronda: Situacion[] = [];
  indice = 0;
  restante = SEGUNDOS_POR_JUGADA;
  ultima: Respuesta | null = null;
  mostrandoDevolucion = false;
  puntos = 0;
  aciertos = 0;
  racha = 0;
  mejorRacha = 0;
  highScore = readHighScore(HIGH_SCORE_KEY);
  isNewHighScore = false;

  private devolucionRestante = 0;

  constructor(private audio: GameAudio) {}

  reset() {
    this.status = 'ready';
    this.ronda = [];
    this.indice = 0;
    this.restante = SEGUNDOS_POR_JUGADA;
    this.ultima = null;
    this.mostrandoDevolucion = false;
    this.devolucionRestante = 0;
    this.puntos = 0;
    this.aciertos = 0;
    this.racha = 0;
    this.mejorRacha = 0;
    this.isNewHighScore = false;
  }

  start() {
    this.reset();
    this.ronda = mezclar(SITUACIONES).slice(0, Math.min(JUGADAS_POR_PARTIDA, SITUACIONES.length));
    this.status = 'playing';
    this.audio.playWhistle();
  }

  private get actual(): Situacion | null {
    return this.ronda[this.indice] ?? null;
  }

  /** null = se acabó el tiempo. */
  responder(eligioOut: boolean | null) {
    if (this.status !== 'playing' || this.mostrandoDevolucion) return;
    const situacion = this.actual;
    if (!situacion) return;

    const acerto = eligioOut !== null && eligioOut === situacion.esOut;
    let ganados = 0;
    if (acerto) {
      this.racha += 1;
      this.mejorRacha = Math.max(this.mejorRacha, this.racha);
      this.aciertos += 1;
      // El bono por velocidad usa el tiempo que sobró: dudar cuesta puntos, no la respuesta.
      const bonoVelocidad = Math.round((this.restante / SEGUNDOS_POR_JUGADA) * PUNTOS_POR_VELOCIDAD);
      ganados = (PUNTOS_BASE + bonoVelocidad) * Math.min(TOPE_RACHA, this.racha);
      this.puntos += ganados;
      this.audio.playCatch();
    } else {
      this.racha = 0;
      this.audio.playHit();
    }

    this.ultima = { situacion, eligioOut, acerto, puntos: ganados };
    this.mostrandoDevolucion = true;
    this.devolucionRestante = SEGUNDOS_DEVOLUCION;
  }

  private siguiente() {
    this.mostrandoDevolucion = false;
    this.ultima = null;
    this.indice += 1;
    if (this.indice >= this.ronda.length) {
      this.terminar();
      return;
    }
    this.restante = SEGUNDOS_POR_JUGADA;
  }

  /** Saltear la devolución sin esperar los segundos completos. */
  avanzar() {
    if (this.mostrandoDevolucion) this.siguiente();
  }

  update(dtSeconds: number) {
    if (this.status !== 'playing') return;
    const dt = Math.min(dtSeconds, MAX_DT);

    if (this.mostrandoDevolucion) {
      this.devolucionRestante -= dt;
      if (this.devolucionRestante <= 0) this.siguiente();
      return;
    }

    this.restante = Math.max(0, this.restante - dt);
    if (this.restante <= 0) this.responder(null);
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

  getSnapshot(): OutONoSnapshot {
    return {
      status: this.status,
      situacion: this.actual,
      indice: this.indice,
      total: this.ronda.length || JUGADAS_POR_PARTIDA,
      restante: this.restante,
      fraccion: this.restante / SEGUNDOS_POR_JUGADA,
      ultima: this.ultima,
      mostrandoDevolucion: this.mostrandoDevolucion,
      score: this.puntos,
      highScore: this.highScore,
      aciertos: this.aciertos,
      racha: this.racha,
      mejorRacha: this.mejorRacha,
    };
  }
}

import type { GameStatus } from '../../../shared/types';
import type { GameAudio } from '../../../shared/audio';
import { readHighScore, writeHighScore } from '../../../shared/highScore';
import type { Aviso, ManosSnapshot, TiroEntrante } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_X,
  PLAYER_Y,
  PLAYER_RADIUS,
  BALL_RADIUS,
  RADIO_ATAJADA,
  RADIO_PERFECTO,
  VIDAS_INICIALES,
  CASTIGO_MANOTAZO,
  VELOCIDAD_INICIAL,
  VELOCIDAD_MAX,
  RAMPA_VELOCIDAD,
  INTERVALO_INICIAL,
  INTERVALO_MIN,
  RAMPA_INTERVALO,
  PROB_PICADA_MAX,
  SEGUNDOS_HASTA_PICADAS,
  HIGH_SCORE_KEY,
} from './constants';

const MAX_DT = 0.05;
const DURACION_AVISO = 0.6;

/**
 * Atajar al vuelo, que en el reglamento es la única jugada que además de eliminar al que tiró
 * devuelve un compañero a la cancha. El juego lo lleva a un solo gesto: tocar en la ventana
 * justa. La vuelta de tuerca es que no todo lo que viene se ataja — una pelota que ya picó no
 * elimina a nadie, así que manotearla es puro riesgo y hay que dejarla pasar.
 */
export class ManosDeGuanteEngine {
  status: GameStatus = 'ready';
  tiros: TiroEntrante[] = [];
  vidas = VIDAS_INICIALES;
  combo = 0;
  mejorCombo = 0;
  companeros = 0;
  puntos = 0;
  castigo = 0;
  highScore = readHighScore(HIGH_SCORE_KEY);
  isNewHighScore = false;

  private transcurrido = 0;
  private nextId = 0;
  private spawnTimer = 0.8;
  private aviso: Aviso | null = null;
  private tapPendiente = false;

  constructor(private audio: GameAudio) {}

  private genId(): string {
    this.nextId += 1;
    return `t${this.nextId}`;
  }

  reset() {
    this.status = 'ready';
    this.tiros = [];
    this.vidas = VIDAS_INICIALES;
    this.combo = 0;
    this.mejorCombo = 0;
    this.companeros = 0;
    this.puntos = 0;
    this.castigo = 0;
    this.transcurrido = 0;
    this.spawnTimer = 0.8;
    this.aviso = null;
    this.tapPendiente = false;
    this.isNewHighScore = false;
  }

  start() {
    this.reset();
    this.status = 'playing';
    this.audio.playWhistle();
  }

  /** Un toque/clic/espacio: intento de atajada. Se resuelve en el próximo update. */
  requestCatch() {
    this.tapPendiente = true;
  }

  private mostrar(tipo: Aviso['tipo']) {
    this.aviso = { tipo, edad: 0 };
  }

  private lanzarTiro() {
    // Sale de cualquier punto del borde de arriba y viaja apuntado al jugador: se lee como un
    // tiro dirigido y no como una lluvia, que es lo que ya hace No Te Quemes.
    const origenX = BALL_RADIUS + Math.random() * (CANVAS_WIDTH - BALL_RADIUS * 2);
    const dx = PLAYER_X - origenX;
    const dy = PLAYER_Y + BALL_RADIUS;
    const largo = Math.hypot(dx, dy) || 1;
    const velocidad = Math.min(VELOCIDAD_MAX, VELOCIDAD_INICIAL + this.transcurrido * RAMPA_VELOCIDAD);

    const progresoPicadas = Math.min(1, this.transcurrido / SEGUNDOS_HASTA_PICADAS);
    const viva = Math.random() > PROB_PICADA_MAX * progresoPicadas;

    this.tiros.push({
      id: this.genId(),
      x: origenX,
      y: -BALL_RADIUS,
      vx: (dx / largo) * velocidad,
      vy: (dy / largo) * velocidad,
      viva,
    });
  }

  private distanciaAlJugador(tiro: TiroEntrante): number {
    return Math.hypot(tiro.x - PLAYER_X, tiro.y - PLAYER_Y);
  }

  /** El tiro vivo más cerca del jugador que esté dentro del radio de atajada. */
  private candidato(): TiroEntrante | null {
    let mejor: TiroEntrante | null = null;
    let mejorDist = Infinity;
    for (const tiro of this.tiros) {
      const d = this.distanciaAlJugador(tiro);
      if (d <= RADIO_ATAJADA && d < mejorDist) {
        mejor = tiro;
        mejorDist = d;
      }
    }
    return mejor;
  }

  private resolverTap() {
    if (this.castigo > 0) return;
    const objetivo = this.candidato();
    if (!objetivo) {
      // Tocar al aire no cuesta vidas, pero corta la racha: premia esperar el momento.
      if (this.combo > 0) this.combo = 0;
      return;
    }

    this.tiros = this.tiros.filter((t) => t.id !== objetivo.id);

    if (!objetivo.viva) {
      // Manotear una picada: no elimina a nadie y te deja sin manos un rato.
      this.castigo = CASTIGO_MANOTAZO;
      this.combo = 0;
      this.mostrar('manotazo');
      this.audio.playEliminate();
      return;
    }

    const perfecta = this.distanciaAlJugador(objetivo) <= RADIO_PERFECTO;
    this.combo += 1;
    this.mejorCombo = Math.max(this.mejorCombo, this.combo);
    this.companeros += 1;
    this.puntos += (perfecta ? 200 : 100) * Math.min(5, this.combo);
    this.mostrar(perfecta ? 'perfecta' : 'atajada');
    this.audio.playCatch();
  }

  private recibirGolpe() {
    this.vidas -= 1;
    this.combo = 0;
    this.mostrar('golpe');
    this.audio.playHit();
    if (this.vidas <= 0) this.terminar();
  }

  update(dtSeconds: number) {
    if (this.status !== 'playing') return;
    const dt = Math.min(dtSeconds, MAX_DT);
    this.transcurrido += dt;

    if (this.castigo > 0) this.castigo = Math.max(0, this.castigo - dt);
    if (this.aviso) {
      this.aviso.edad += dt;
      if (this.aviso.edad > DURACION_AVISO) this.aviso = null;
    }

    const intervalo = Math.max(INTERVALO_MIN, INTERVALO_INICIAL - this.transcurrido * RAMPA_INTERVALO);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = intervalo;
      this.lanzarTiro();
    }

    for (const tiro of this.tiros) {
      tiro.x += tiro.vx * dt;
      tiro.y += tiro.vy * dt;
    }

    // El tap se resuelve después de mover: así la ventana que ve el jugador es la que vale.
    if (this.tapPendiente) {
      this.tapPendiente = false;
      this.resolverTap();
      if (this.status !== 'playing') return;
    }

    const siguen: TiroEntrante[] = [];
    for (const tiro of this.tiros) {
      const impacto = this.distanciaAlJugador(tiro) < PLAYER_RADIUS + BALL_RADIUS;
      if (impacto) {
        if (tiro.viva) {
          this.recibirGolpe();
          if (this.status !== 'playing') return;
        } else {
          // Dejar pasar una picada es lo correcto: suma poco, pero suma.
          this.puntos += 25;
          this.mostrar('dejaste-pasar');
        }
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

  getSnapshot(): ManosSnapshot {
    return {
      status: this.status,
      tiros: this.tiros,
      vidas: this.vidas,
      score: this.puntos,
      highScore: this.highScore,
      combo: this.combo,
      mejorCombo: this.mejorCombo,
      companeros: this.companeros,
      castigo: this.castigo,
      aviso: this.aviso,
    };
  }
}

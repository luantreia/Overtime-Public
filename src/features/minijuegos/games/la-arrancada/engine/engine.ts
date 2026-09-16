import type { GameStatus, Vector2 } from '../../../shared/types';
import type { GameAudio } from '../../../shared/audio';
import { clamp, distance } from '../../../shared/collisions';
import { readHighScore, writeHighScore } from '../../../shared/highScore';
import type { ArrancadaSnapshot, Aviso, PelotaLibre, Rival, TiroRival } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LINEA_MEDIO,
  LINEA_ACTIVACION,
  LINEA_FONDO,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  BALL_RADIUS,
  RIVAL_RADIUS,
  RIVALES,
  RIVAL_SPEED_INICIAL,
  RIVAL_SPEED_MAX,
  RIVAL_RAMPA,
  INTERVALO_TIRO_INICIAL,
  INTERVALO_TIRO_MIN,
  RAMPA_TIRO,
  VELOCIDAD_TIRO,
  VIDAS_INICIALES,
  DURACION_PARTIDA,
  PELOTAS_EN_LINEA,
  RESPAWN_PELOTA,
  PUNTOS_ACTIVACION,
  HIGH_SCORE_KEY,
} from './constants';

const MAX_DT = 0.05;
const DURACION_AVISO = 0.6;
const RIVAL_BASE_Y = 52;

/**
 * La arrancada: las pelotas están sobre la línea del medio y las corren los dos equipos. Lo que
 * lo hace un juego y no una carrera es la línea de activación — levantar la pelota no sirve de
 * nada hasta que volvés con ella y la cruzás. Cada pelota es entonces una apuesta: cuanto más
 * lejos vas, más te expone la vuelta a los rivales que ya activaron y están tirando.
 */
export class ArrancadaEngine {
  status: GameStatus = 'ready';
  jugador: Vector2 = { x: CANVAS_WIDTH / 2, y: LINEA_FONDO - PLAYER_RADIUS };
  llevaPelota = false;
  pelotas: PelotaLibre[] = [];
  rivales: Rival[] = [];
  tiros: TiroRival[] = [];
  vidas = VIDAS_INICIALES;
  activadas = 0;
  puntos = 0;
  restante = DURACION_PARTIDA;
  highScore = readHighScore(HIGH_SCORE_KEY);
  isNewHighScore = false;

  private transcurrido = 0;
  private nextId = 0;
  private respawnTimer = 0;
  private aviso: Aviso | null = null;
  /** Dirección pedida por el input, normalizada por el canvas antes de llegar acá. */
  private destino: Vector2 | null = null;

  constructor(private audio: GameAudio) {}

  private genId(prefijo: string): string {
    this.nextId += 1;
    return `${prefijo}${this.nextId}`;
  }

  private sembrarPelotas() {
    this.pelotas = Array.from({ length: PELOTAS_EN_LINEA }, (_, i) => ({
      id: this.genId('p'),
      x: ((i + 0.5) * CANVAS_WIDTH) / PELOTAS_EN_LINEA,
      y: LINEA_MEDIO,
      disponible: true,
    }));
  }

  private sembrarRivales() {
    this.rivales = Array.from({ length: RIVALES }, (_, i) => ({
      id: this.genId('r'),
      x: ((i + 0.5) * CANVAS_WIDTH) / RIVALES,
      y: RIVAL_BASE_Y,
      estado: 'yendo' as const,
      objetivoId: null,
      recarga: 0.8 + i * 0.5,
    }));
  }

  reset() {
    this.status = 'ready';
    this.jugador = { x: CANVAS_WIDTH / 2, y: LINEA_FONDO - PLAYER_RADIUS };
    this.llevaPelota = false;
    this.tiros = [];
    this.vidas = VIDAS_INICIALES;
    this.activadas = 0;
    this.puntos = 0;
    this.restante = DURACION_PARTIDA;
    this.transcurrido = 0;
    this.respawnTimer = 0;
    this.aviso = null;
    this.destino = null;
    this.isNewHighScore = false;
    this.sembrarPelotas();
    this.sembrarRivales();
  }

  start() {
    this.reset();
    this.status = 'playing';
    this.audio.playWhistle();
  }

  /** Punto del canvas al que el jugador se mueve (dedo o mouse). null = quieto. */
  setDestino(punto: Vector2 | null) {
    this.destino = punto;
  }

  private mostrar(tipo: Aviso['tipo']) {
    this.aviso = { tipo, edad: 0 };
  }

  private moverJugador(dt: number) {
    if (!this.destino) return;
    const dx = this.destino.x - this.jugador.x;
    const dy = this.destino.y - this.jugador.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return;
    const paso = Math.min(dist, PLAYER_SPEED * dt);
    this.jugador.x += (dx / dist) * paso;
    this.jugador.y += (dy / dist) * paso;

    // No se puede cruzar a la mitad rival: la línea del medio es el tope.
    this.jugador.x = clamp(this.jugador.x, PLAYER_RADIUS, CANVAS_WIDTH - PLAYER_RADIUS);
    this.jugador.y = clamp(this.jugador.y, LINEA_MEDIO + PLAYER_RADIUS * 0.4, LINEA_FONDO - PLAYER_RADIUS);
  }

  private levantarPelota() {
    if (this.llevaPelota) return;
    for (const pelota of this.pelotas) {
      if (!pelota.disponible) continue;
      if (distance(this.jugador, pelota) < PLAYER_RADIUS + BALL_RADIUS) {
        pelota.disponible = false;
        this.llevaPelota = true;
        this.mostrar('levantada');
        this.audio.playPowerUp();
        return;
      }
    }
  }

  private intentarActivar() {
    if (!this.llevaPelota) return;
    if (this.jugador.y < LINEA_ACTIVACION) return;
    this.llevaPelota = false;
    this.activadas += 1;
    this.puntos += PUNTOS_ACTIVACION;
    this.mostrar('activada');
    this.audio.playCatch();
  }

  private velocidadRival(): number {
    return Math.min(RIVAL_SPEED_MAX, RIVAL_SPEED_INICIAL + this.transcurrido * RIVAL_RAMPA);
  }

  private moverRivales(dt: number) {
    const velocidad = this.velocidadRival();
    const intervaloTiro = Math.max(INTERVALO_TIRO_MIN, INTERVALO_TIRO_INICIAL - this.transcurrido * RAMPA_TIRO);

    for (const rival of this.rivales) {
      if (rival.estado === 'yendo') {
        const objetivo =
          this.pelotas.find((p) => p.id === rival.objetivoId && p.disponible) ??
          this.pelotas
            .filter((p) => p.disponible)
            .sort((a, b) => Math.abs(a.x - rival.x) - Math.abs(b.x - rival.x))[0];

        if (!objetivo) {
          // Sin pelotas libres se queda merodeando en su mitad.
          rival.objetivoId = null;
          rival.y = Math.max(RIVAL_BASE_Y, rival.y - velocidad * dt * 0.4);
          continue;
        }

        rival.objetivoId = objetivo.id;
        const dx = objetivo.x - rival.x;
        const dy = objetivo.y - rival.y;
        const dist = Math.hypot(dx, dy) || 1;
        const paso = Math.min(dist, velocidad * dt);
        rival.x += (dx / dist) * paso;
        rival.y += (dy / dist) * paso;

        if (dist < RIVAL_RADIUS + BALL_RADIUS) {
          objetivo.disponible = false;
          rival.estado = 'volviendo';
          rival.objetivoId = null;
        }
        continue;
      }

      if (rival.estado === 'volviendo') {
        rival.y -= velocidad * dt;
        if (rival.y <= RIVAL_BASE_Y) {
          rival.y = RIVAL_BASE_Y;
          rival.estado = 'armado';
          rival.recarga = intervaloTiro * (0.6 + Math.random() * 0.6);
        }
        continue;
      }

      // Armado: tira y vuelve a buscar otra pelota.
      rival.recarga -= dt;
      if (rival.recarga <= 0) {
        this.tirar(rival);
        rival.estado = 'yendo';
      }
    }
  }

  private tirar(rival: Rival) {
    const dx = this.jugador.x - rival.x;
    const dy = this.jugador.y - rival.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.tiros.push({
      id: this.genId('t'),
      x: rival.x,
      y: rival.y,
      vx: (dx / dist) * VELOCIDAD_TIRO,
      vy: (dy / dist) * VELOCIDAD_TIRO,
    });
    this.audio.playThrow();
  }

  private recibirGolpe() {
    this.vidas -= 1;
    if (this.llevaPelota) {
      // Te pegan con la pelota sin activar en la mano: se pierde el viaje entero.
      this.llevaPelota = false;
      this.mostrar('sin-activar');
    } else {
      this.mostrar('golpe');
    }
    this.audio.playHit();
    this.jugador = { x: CANVAS_WIDTH / 2, y: LINEA_FONDO - PLAYER_RADIUS };
    this.destino = null;
    if (this.vidas <= 0) this.terminar();
  }

  update(dtSeconds: number) {
    if (this.status !== 'playing') return;
    const dt = Math.min(dtSeconds, MAX_DT);
    this.transcurrido += dt;
    this.restante = Math.max(0, this.restante - dt);

    if (this.aviso) {
      this.aviso.edad += dt;
      if (this.aviso.edad > DURACION_AVISO) this.aviso = null;
    }

    this.moverJugador(dt);
    this.levantarPelota();
    this.intentarActivar();
    this.moverRivales(dt);

    // Reponer pelotas sobre la línea, para que siempre haya algo que ir a buscar.
    if (this.pelotas.some((p) => !p.disponible)) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawnTimer = RESPAWN_PELOTA;
        const vacia = this.pelotas.find((p) => !p.disponible);
        if (vacia) vacia.disponible = true;
      }
    } else {
      this.respawnTimer = RESPAWN_PELOTA;
    }

    const siguen: TiroRival[] = [];
    for (const tiro of this.tiros) {
      tiro.x += tiro.vx * dt;
      tiro.y += tiro.vy * dt;
      if (distance(tiro, this.jugador) < PLAYER_RADIUS + BALL_RADIUS) {
        this.recibirGolpe();
        if (this.status !== 'playing') return;
        continue;
      }
      const dentro = tiro.x > -40 && tiro.x < CANVAS_WIDTH + 40 && tiro.y > -40 && tiro.y < CANVAS_HEIGHT + 40;
      if (dentro) siguen.push(tiro);
    }
    this.tiros = siguen;

    if (this.restante <= 0) this.terminar();
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

  getSnapshot(): ArrancadaSnapshot {
    return {
      status: this.status,
      jugador: this.jugador,
      llevaPelota: this.llevaPelota,
      pelotas: this.pelotas,
      rivales: this.rivales,
      tiros: this.tiros,
      vidas: this.vidas,
      score: this.puntos,
      highScore: this.highScore,
      activadas: this.activadas,
      segundosRestantes: this.restante,
      aviso: this.aviso,
    };
  }
}

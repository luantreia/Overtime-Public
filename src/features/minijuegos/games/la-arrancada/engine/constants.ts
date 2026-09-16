export const CANVAS_WIDTH = 380;
export const CANVAS_HEIGHT = 560;

/** La cancha ocupa todo el canvas: arriba el rival, abajo vos. */
export const LINEA_MEDIO = 120;
/**
 * Tu línea de activación. Una pelota agarrada en la arrancada no elimina hasta que cruza esta
 * línea (Cloth Rule 13.11.1 / Foam Rule 13.1), así que no alcanza con levantarla: hay que
 * volver con ella. Esa vuelta es todo el riesgo del juego.
 */
export const LINEA_ACTIVACION = 380;
export const LINEA_FONDO = CANVAS_HEIGHT - 30;

export const PLAYER_RADIUS = 18;
export const PLAYER_SPEED = 250;
export const BALL_RADIUS = 12;

export const RIVAL_RADIUS = 17;
export const RIVALES = 3;
export const RIVAL_SPEED_INICIAL = 120;
export const RIVAL_SPEED_MAX = 290;
export const RIVAL_RAMPA = 9;

/** Cada cuánto tira un rival que ya volvió a su mitad con pelota. */
export const INTERVALO_TIRO_INICIAL = 1.6;
export const INTERVALO_TIRO_MIN = 0.55;
export const RAMPA_TIRO = 0.022;
export const VELOCIDAD_TIRO = 300;

export const VIDAS_INICIALES = 3;
export const DURACION_PARTIDA = 60;

/** Pelotas sobre la línea del medio, como en la arrancada real. */
export const PELOTAS_EN_LINEA = 5;
export const RESPAWN_PELOTA = 2.2;

export const PUNTOS_ACTIVACION = 100;

export const HIGH_SCORE_KEY = 'minijuegos:la-arrancada:highscore';

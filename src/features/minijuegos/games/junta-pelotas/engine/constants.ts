export const CANVAS_WIDTH = 380;
export const CANVAS_HEIGHT = 560;

/** Borde superior de la cancha. El shagger trabaja por fuera, nunca adentro. */
export const CANCHA_TOP = 150;
export const CANCHA_BOTTOM = CANVAS_HEIGHT - 40;
/** El pasillo de afuera donde se mueve el shagger. */
export const PASILLO_Y = 92;
export const SHAGGER_RADIUS = 18;
export const SHAGGER_SPEED = 240;

/**
 * Tu mitad llega hasta la línea del medio y ni un centímetro más: un shagger no puede juntar
 * pelotas del lado del rival (Cloth Rule 31.4 / Foam Rule 4.3).
 */
export const LINEA_MEDIO_X = CANVAS_WIDTH - 46;
/** Detrás de esto devolvés la pelota a la cancha (Cloth Rule 31.13). */
export const LINEA_ATAQUE_X = 96;

export const BALL_RADIUS = 11;
/** Cuántas pelotas podés llevar encima a la vez. */
export const CAPACIDAD = 2;

/**
 * Suministro: el equipo en cancha se queda sin pelotas si no se las devolvés. Es la traducción
 * arcade de "las pelotas tienen que volver al juego lo antes posible" (Rule 31.12).
 */
export const SUMINISTRO_MAX = 100;
export const SUMINISTRO_DRENAJE = 7.0;
export const SUMINISTRO_POR_PELOTA = 17;

export const INTERVALO_SALIDA_INICIAL = 1.9;
export const INTERVALO_SALIDA_MIN = 0.75;
export const RAMPA_SALIDA = 0.022;

export const PUNTOS_POR_PELOTA = 100;
/** Bonus por entregar la carga llena de una sola vez. */
export const BONUS_CARGA_LLENA = 120;

export const HIGH_SCORE_KEY = 'minijuegos:junta-pelotas:highscore';

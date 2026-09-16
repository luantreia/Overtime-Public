export const CANVAS_WIDTH = 380;
export const CANVAS_HEIGHT = 640;

export const PLAYER_X = CANVAS_WIDTH / 2;
export const PLAYER_Y = CANVAS_HEIGHT - 110;
export const PLAYER_RADIUS = 28;
export const BALL_RADIUS = 15;

/** Distancia al jugador dentro de la cual la acción (bloquear o esquivar) resuelve el tiro. */
export const RADIO_ACCION = 74;

export const VIDAS_INICIALES = 3;

export const VELOCIDAD_INICIAL = 230;
export const VELOCIDAD_MAX = 600;
export const RAMPA_VELOCIDAD = 10;

export const INTERVALO_INICIAL = 1.25;
export const INTERVALO_MIN = 0.5;
export const RAMPA_INTERVALO = 0.019;

/**
 * Tiros que aguanta cada fase. El set arranca con bloqueo permitido y, pasados unos cuantos
 * tiros, el árbitro canta No-Blocking (Foam Rule 28): a partir de ahí la pelota que tenés en la
 * mano cuenta como tu cuerpo, así que bloquear te elimina y solo queda esquivar.
 */
export const TIROS_FASE_NORMAL = 9;
export const TIROS_FASE_NO_BLOCKING = 6;

/** Segundos que el cartel de cambio de fase frena los tiros, para que se lea. */
export const PAUSA_CAMBIO_FASE = 1.6;

/** Esquivar siempre es seguro pero paga menos: bloquear es la jugada que conserva la pelota. */
export const PUNTOS_BLOQUEO = 150;
export const PUNTOS_ESQUIVE = 60;

export const HIGH_SCORE_KEY = 'minijuegos:muralla:highscore';

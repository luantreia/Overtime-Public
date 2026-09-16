export const CANVAS_WIDTH = 380;
export const CANVAS_HEIGHT = 640;

export const PLAYER_X = CANVAS_WIDTH / 2;
export const PLAYER_Y = CANVAS_HEIGHT - 104;
export const PLAYER_RADIUS = 26;
export const BALL_RADIUS = 15;

/** Distancia al jugador dentro de la cual un toque cuenta como intento de atajada. */
export const RADIO_ATAJADA = 62;
/** Adentro de este radio la atajada es "perfecta" y vale doble. */
export const RADIO_PERFECTO = 30;

export const VIDAS_INICIALES = 3;
/** Segundos sin poder atajar después de manotear una pelota que ya picó. */
export const CASTIGO_MANOTAZO = 0.7;

export const VELOCIDAD_INICIAL = 240;
export const VELOCIDAD_MAX = 620;
export const RAMPA_VELOCIDAD = 11;

export const INTERVALO_INICIAL = 1.3;
export const INTERVALO_MIN = 0.48;
export const RAMPA_INTERVALO = 0.02;

/**
 * Proporción de tiros que llegan ya picados. Una pelota que picó no elimina a nadie, así que
 * atajarla no suma: hay que dejarla pasar. Arranca en 0 y sube, para que las primeras jugadas
 * enseñen el gesto antes de pedir criterio.
 */
export const PROB_PICADA_MAX = 0.34;
export const SEGUNDOS_HASTA_PICADAS = 12;

export const HIGH_SCORE_KEY = 'minijuegos:manos-de-guante:highscore';

/**
 * Récord por juego, guardado en este dispositivo. Cada juego trae su propia clave.
 *
 * Va envuelto en try/catch a propósito: en modo privado de Safari y con las cookies de sitio
 * bloqueadas, `localStorage` existe pero `setItem` tira. El récord es un extra: perderlo no
 * justifica que se caiga el loop del juego.
 */
const storage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

export const readHighScore = (key: string): number => {
  try {
    const raw = storage()?.getItem(key);
    const value = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

export const writeHighScore = (key: string, value: number): void => {
  try {
    storage()?.setItem(key, String(value));
  } catch {
    /* sin persistencia: el juego sigue igual, solo no se recuerda el récord */
  }
};

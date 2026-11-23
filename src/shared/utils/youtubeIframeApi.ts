/**
 * Carga perezosa de la YouTube IFrame Player API. A diferencia de un `<iframe>` suelto, la API
 * avisa cuándo termina un video o cuándo falla, que es lo que necesita Overtime TV para pasar
 * solo al siguiente partido.
 *
 * Se carga una sola vez por sesión: varias llamadas comparten la misma promesa.
 */

export interface YTPlayer {
  loadVideoById(opts: { videoId: string; startSeconds?: number }): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  setPlaybackRate(rate: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement | string,
    opts: {
      host?: string;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let promesa: Promise<YTNamespace> | null = null;

export const cargarYoutubeIframeApi = (): Promise<YTNamespace> => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (promesa) return promesa;

  promesa = new Promise((resolve, reject) => {
    const anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      anterior?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      promesa = null;
      reject(new Error('No se pudo cargar el reproductor de YouTube'));
    };
    document.head.appendChild(script);
  });
  return promesa;
};

/**
 * Segundo de inicio desde el `t=` del link (`106`, `106s`, `1m46s`, `1h2m3s`). La gente copia
 * links con el minuto donde arranca el partido de verdad, así que vale respetarlo.
 */
export const extraerInicioYoutube = (input?: string | null): number => {
  if (!input) return 0;
  let t: string | null = null;
  try {
    const url = new URL(input.trim().startsWith('http') ? input.trim() : `https://${input.trim()}`);
    t = url.searchParams.get('t') ?? url.searchParams.get('start');
  } catch {
    return 0;
  }
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
};

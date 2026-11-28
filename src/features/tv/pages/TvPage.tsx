import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ShareIcon,
  SignalIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TvIcon,
} from '@heroicons/react/24/solid';
import { fetchWithAuth } from '../../../utils/apiClient';
import { cargarYoutubeIframeApi, type YTPlayer } from '../../../shared/utils/youtubeIframeApi';
import { grilla, nombreCompetencia, videosDelCanal, type CanalTv, type Emision, type VideoTv } from '../programacion';

/**
 * Overtime TV.
 *
 * - **En vivo**: una grilla igual para todos según el reloj (ver `programacion.ts`). No se puede
 *   pausar, adelantar ni saltear; al volver de otra página seguís donde va la emisión. Lo único
 *   que se permite es la repetición: los últimos 10 segundos en cámara lenta.
 * - **On demand** (`?ver=<partidoId>`): cualquier partido del catálogo desde el principio, con
 *   controles normales. La posición se recuerda en la sesión, y al terminar vuelve al vivo.
 */

const SEGUNDOS_REPETICION = 10;
const VELOCIDAD_REPETICION = 0.5;
const TOLERANCIA_DESFASE_S = 4;
const AVISO_PROXIMO_MS = 20_000;

interface CatalogoTv {
  items: VideoTv[];
  /** Canales de Overtime-Admin. Vacío = un canal por competencia. */
  canales: CanalTv[];
  /** Diferencia entre el reloj del servidor y el local, para que todos vean el mismo segundo. */
  desfase: number;
}

const hora = (ms: number) => new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
const fechaCorta = (f?: string) =>
  f ? new Date(f).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const esPartido = (v: VideoTv) => v.partidoId !== null;
const titulo = (v: VideoTv) =>
  esPartido(v) ? `${v.equipoLocal?.nombre ?? 'Local'} vs ${v.equipoVisitante?.nombre ?? 'Visitante'}` : v.titulo || 'Video';
const subtitulo = (v: VideoTv) =>
  (esPartido(v) ? [nombreCompetencia(v), v.fase?.nombre, fechaCorta(v.fecha)] : [v.competencia?.nombre]).filter(Boolean).join(' · ');
const claveVod = (id: string) => `tv-vod-${id}`;

const Escudo: React.FC<{ src?: string; nombre: string }> = ({ src, nombre }) =>
  src ? (
    <img src={src} alt="" className="h-8 w-8 rounded-full bg-white object-contain" />
  ) : (
    <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
      {nombre.slice(0, 2).toUpperCase()}
    </span>
  );

/** Escudo + nombre; si el equipo tiene ficha, todo el bloque lleva a ella. */
const LadoEquipo: React.FC<{ equipo?: VideoTv['equipoLocal']; fallback: string; invertido?: boolean }> = ({
  equipo,
  fallback,
  invertido,
}) => {
  const nombre = equipo?.nombre ?? fallback;
  const clase = `flex min-w-0 flex-1 items-center gap-2 ${invertido ? 'flex-row-reverse text-right' : ''}`;
  const contenido = (
    <>
      <Escudo src={equipo?.escudo} nombre={nombre} />
      <span className="truncate font-semibold">{nombre}</span>
    </>
  );
  return equipo?._id ? (
    <Link to={`/equipos/${equipo._id}`} className={`${clase} rounded hover:underline`} title={`Ver ${nombre}`}>
      {contenido}
    </Link>
  ) : (
    <div className={clase}>{contenido}</div>
  );
};

const Marcador: React.FC<{ video: VideoTv; mostrarResultado: boolean }> = ({ video, mostrarResultado }) => {
  if (!esPartido(video)) return <p className="truncate text-center font-semibold">{titulo(video)}</p>;
  const hay = mostrarResultado && typeof video.marcadorLocal === 'number' && typeof video.marcadorVisitante === 'number';
  return (
    <div className="flex min-w-0 items-center gap-3">
      <LadoEquipo equipo={video.equipoLocal} fallback="Local" />
      <span className="shrink-0 font-bold tabular-nums text-brand-300">
        {hay ? `${video.marcadorLocal} – ${video.marcadorVisitante}` : 'vs'}
      </span>
      <LadoEquipo equipo={video.equipoVisitante} fallback="Visitante" invertido />
    </div>
  );
};

const BotonIcono: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    type="button"
    className={`flex h-11 w-10 items-center justify-center rounded-lg sm:w-11 hover:bg-white/10 disabled:opacity-40 ${className}`}
    {...props}
  />
);

/** Celular en horizontal: el video pasa a ocupar toda la pantalla. */
const CONSULTA_APAISADO = '(orientation: landscape) and (max-height: 500px)';
const useApaisado = () => {
  const [apaisado, setApaisado] = useState(() => window.matchMedia?.(CONSULTA_APAISADO).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(CONSULTA_APAISADO);
    if (!mq) return;
    const alCambiar = () => setApaisado(mq.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);
  return apaisado;
};

const TvPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const canal = searchParams.get('canal') ?? '';
  const ver = searchParams.get('ver');

  const { data, isLoading, isError, refetch } = useQuery<CatalogoTv>({
    queryKey: ['tv', 'catalogo'],
    queryFn: async () => {
      const r = await fetchWithAuth<{ ahora: number; items: VideoTv[]; canales?: CanalTv[] }>('/tv/videos');
      return { items: r.items ?? [], canales: r.canales ?? [], desfase: (r.ahora ?? Date.now()) - Date.now() };
    },
    staleTime: 1000 * 60 * 5,
  });
  const items = useMemo(() => data?.items ?? [], [data]);
  const canalesAdmin = useMemo(() => data?.canales ?? [], [data]);
  const desfase = data?.desfase ?? 0;
  const reloj = useCallback(() => Date.now() + desfase, [desfase]);

  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(reloj()), 1000);
    return () => window.clearInterval(t);
  }, [reloj]);

  // [valor del <select>, nombre, cantidad]. Con canales de Admin el valor es el slug.
  const canales = useMemo((): [string, string, number][] => {
    if (canalesAdmin.length) return canalesAdmin.map((c) => [c.slug, c.nombre, c.ids.length]);
    const conteo = new Map<string, number>();
    items.forEach((v) => conteo.set(nombreCompetencia(v), (conteo.get(nombreCompetencia(v)) ?? 0) + 1));
    return Array.from(conteo.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, n]): [string, string, number] => [nombre, nombre, n]);
  }, [items, canalesAdmin]);

  const { actual, emisiones } = useMemo(() => grilla(items, canal, ahora, 4, 10, canalesAdmin), [items, canal, ahora, canalesAdmin]);
  const vod = ver ? items.find((v) => v._id === ver) ?? null : null;
  const modo: 'vivo' | 'vod' = vod ? 'vod' : 'vivo';
  const enPantalla: VideoTv | null = vod ?? actual?.video ?? null;
  const proxima = actual ? emisiones.find((e) => e.desde === actual.hasta) : undefined;

  // --- Player -----------------------------------------------------------------------------
  const contenedor = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const cargado = useRef<string | null>(null);
  const [listo, setListo] = useState(false);
  const [errorApi, setErrorApi] = useState(false);
  const [silenciado, setSilenciado] = useState(true);
  const [repitiendo, setRepitiendo] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  /** Clave (`cargado`) del video que YouTube no pudo reproducir: privado, borrado o sin embed. */
  const [fallido, setFallido] = useState<string | null>(null);

  const segundoEsperado = useCallback((e: Emision) => e.video.inicio + (reloj() - e.desde) / 1000, [reloj]);

  // Lo que necesitan los callbacks del player, siempre en su versión vigente.
  const vivoRef = useRef({ actual, modo, vod, segundoEsperado });
  vivoRef.current = { actual, modo, vod, segundoEsperado };

  const volverAlVivo = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('ver');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);
  const volverAlVivoRef = useRef(volverAlVivo);
  volverAlVivoRef.current = volverAlVivo;

  const hayContenido = enPantalla !== null;

  // El player se recrea al cambiar de modo: en vivo no lleva controles, on demand sí, y
  // YouTube no deja cambiar eso sobre un player ya creado.
  useEffect(() => {
    if (!hayContenido || !contenedor.current) return;
    let cancelado = false;
    const destino = document.createElement('div');
    contenedor.current.appendChild(destino);

    const { actual: a, vod: v, segundoEsperado: esperado } = vivoRef.current;
    const video = v ?? a?.video;
    if (!video) return;
    const inicio = v
      ? Number(sessionStorage.getItem(claveVod(v._id))) || v.inicio
      : a
        ? esperado(a)
        : 0;
    cargado.current = v ? `vod-${v._id}` : a ? `${a.desde}-${a.video._id}` : null;

    cargarYoutubeIframeApi()
      .then((YT) => {
        if (cancelado) return;
        player.current = new YT.Player(destino, {
          host: 'https://www.youtube-nocookie.com',
          videoId: video.videoId,
          playerVars: {
            autoplay: 1,
            mute: 1, // autoplay con sonido lo bloquean los navegadores; se activa con un clic
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            start: Math.floor(inicio),
            controls: modo === 'vod' ? 1 : 0,
            disablekb: modo === 'vod' ? 0 : 1,
          },
          events: {
            onReady: (e) => {
              setListo(true);
              if (sessionStorage.getItem('tv-sonido') === '1') {
                e.target.unMute();
                // Si el navegador no lo permitió, sigue silenciado: reflejarlo.
                window.setTimeout(() => setSilenciado(e.target.isMuted()), 800);
              }
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED && vivoRef.current.modo === 'vod') {
                const id = vivoRef.current.vod?._id;
                if (id) sessionStorage.removeItem(claveVod(id));
                volverAlVivoRef.current();
              }
            },
            onError: (e) => {
              console.warn('[Overtime TV] error del reproductor', e.data, cargado.current);
              setFallido(cargado.current);
            },
          },
        });
      })
      .catch(() => !cancelado && setErrorApi(true));

    return () => {
      cancelado = true;
      player.current?.destroy();
      player.current = null;
      setListo(false);
      setRepitiendo(false);
      destino.remove();
    };
    // Se recrea sólo al cambiar de modo o de partido on demand; en vivo, los cambios de
    // emisión se cargan sobre el mismo player (efecto de abajo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, vod?._id, hayContenido]);

  // En vivo: al cambiar la emisión, cargar el siguiente partido en el segundo que corresponde.
  useEffect(() => {
    if (modo !== 'vivo' || !listo || !player.current || !actual) return;
    const clave = `${actual.desde}-${actual.video._id}`;
    if (cargado.current === clave) return;
    cargado.current = clave;
    setRepitiendo(false);
    player.current.setPlaybackRate(1);
    player.current.loadVideoById({ videoId: actual.video.videoId, startSeconds: segundoEsperado(actual) });
  }, [modo, listo, actual, segundoEsperado]);

  // En vivo: corregir el desfase (buffering, pestaña en segundo plano) y no dejar que quede pausado.
  useEffect(() => {
    if (modo !== 'vivo' || !listo || repitiendo) return;
    const t = window.setInterval(() => {
      const p = player.current;
      const a = vivoRef.current.actual;
      if (!p || !a || !window.YT) return;
      const esperado = vivoRef.current.segundoEsperado(a);
      if (Math.abs(p.getCurrentTime() - esperado) > TOLERANCIA_DESFASE_S) p.seekTo(esperado, true);
      if (p.getPlayerState() === window.YT.PlayerState.PAUSED) p.playVideo();
    }, 3000);
    return () => window.clearInterval(t);
  }, [modo, listo, repitiendo]);

  // On demand: recordar por dónde iba, para retomar al volver de la ficha del partido.
  useEffect(() => {
    if (modo !== 'vod' || !listo || !vod) return;
    const t = window.setInterval(() => {
      const s = player.current?.getCurrentTime();
      if (s) sessionStorage.setItem(claveVod(vod._id), String(Math.floor(s)));
    }, 5000);
    return () => window.clearInterval(t);
  }, [modo, listo, vod]);

  const repetir = () => {
    const p = player.current;
    if (!p || repitiendo || !enPantalla) return;
    const desde = Math.max(enPantalla.inicio, p.getCurrentTime() - SEGUNDOS_REPETICION);
    p.seekTo(desde, true);
    p.setPlaybackRate(VELOCIDAD_REPETICION);
    setRepitiendo(true);
  };

  // Termina la repetición: velocidad normal y, en vivo, de vuelta al segundo de la emisión.
  useEffect(() => {
    if (!repitiendo) return;
    const t = window.setTimeout(() => {
      const p = player.current;
      setRepitiendo(false);
      if (!p) return;
      p.setPlaybackRate(1);
      const a = vivoRef.current.actual;
      if (vivoRef.current.modo === 'vivo' && a) p.seekTo(vivoRef.current.segundoEsperado(a), true);
    }, (SEGUNDOS_REPETICION / VELOCIDAD_REPETICION) * 1000);
    return () => window.clearTimeout(t);
  }, [repitiendo]);

  const alternarSonido = () => {
    const p = player.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      p.playVideo();
      sessionStorage.setItem('tv-sonido', '1');
      setSilenciado(false);
    } else {
      p.mute();
      sessionStorage.removeItem('tv-sonido');
      setSilenciado(true);
    }
  };

  // --- Compartir ---------------------------------------------------------------------------
  // El link abre ese partido on demand; la vista previa (OG) la arma api/seo.js para los bots.
  const [copiado, setCopiado] = useState(false);
  const compartir = async () => {
    if (!enPantalla) return;
    const url = `${window.location.origin}/tv?ver=${enPantalla._id}`;
    const title = `${titulo(enPantalla)} en Overtime TV`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Mirá ${titulo(enPantalla)} en Overtime TV`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') console.warn('[Overtime TV] no se pudo compartir', err);
    }
  };

  // --- Expandir / horizontal ------------------------------------------------------------------
  // Pantalla completa nativa donde se puede (Android, desktop); en iPhone Safari no deja poner
  // en fullscreen un div, así que el mismo estado lo resuelve por CSS (fixed inset-0).
  const pantalla = useRef<HTMLDivElement>(null);
  const [expandido, setExpandido] = useState(false);
  const apaisado = useApaisado();
  const inmersivo = expandido || apaisado;

  const pantallaCompleta = () => {
    if (expandido) {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
      setExpandido(false);
      return;
    }
    setExpandido(true);
    pantalla.current
      ?.requestFullscreen?.()
      .then(() => {
        const o = window.screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        return o?.lock?.('landscape');
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    const alSalir = () => !document.fullscreenElement && setExpandido(false);
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && setExpandido(false);
    document.addEventListener('fullscreenchange', alSalir);
    window.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('fullscreenchange', alSalir);
      window.removeEventListener('keydown', alTeclear);
    };
  }, []);

  // Sin scroll de fondo mientras el video ocupa toda la pantalla.
  useEffect(() => {
    if (!inmersivo) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [inmersivo]);

  const cambiarCanal = (nuevo: string) => {
    const next = new URLSearchParams(searchParams);
    if (nuevo) next.set('canal', nuevo);
    else next.delete('canal');
    next.delete('ver');
    setSearchParams(next, { replace: true });
  };

  const verOnDemand = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('ver', id);
    setSearchParams(next);
  };

  const [pestana, setPestana] = useState<'guia' | 'ondemand'>('guia');
  const catalogoCanal = useMemo(
    () =>
      videosDelCanal(items, canal, canalesAdmin)
        .slice()
        .sort((a, b) => String(b.fecha ?? '').localeCompare(String(a.fecha ?? ''))),
    [items, canal, canalesAdmin],
  );

  // --- Render -----------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
        <TvIcon className="mr-2 h-6 w-6 animate-pulse" aria-hidden="true" /> Sintonizando Overtime TV…
      </div>
    );
  }

  if (isError || errorApi) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="mb-4 text-slate-700">No pudimos encender Overtime TV.</p>
        <button
          type="button"
          onClick={() => (errorApi ? window.location.reload() : refetch())}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-slate-700">
        Todavía no hay partidos con video. Cuando se carguen links de YouTube a los partidos, van a aparecer acá.
      </div>
    );
  }

  const restante = actual ? actual.hasta - ahora : Infinity;
  const claveEnPantalla = vod ? `vod-${vod._id}` : actual ? `${actual.desde}-${actual.video._id}` : null;
  const noDisponible = fallido !== null && fallido === claveEnPantalla;

  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <header className="flex min-w-0 items-center justify-between gap-3">
        <h1 className="flex shrink-0 items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
          <TvIcon className="h-6 w-6 text-brand-600 sm:h-7 sm:w-7" aria-hidden="true" /> Overtime TV
        </h1>
        <label className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
          <span className="sr-only sm:not-sr-only">Canal</span>
          <select
            value={canal}
            onChange={(e) => cambiarCanal(e.target.value)}
            className="min-w-0 max-w-full truncate rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm sm:max-w-xs"
          >
            <option value="">Todos los canales ({items.length})</option>
            {canales.map(([valor, nombre, n]) => (
              <option key={valor} value={valor}>
                {nombre} ({n})
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div
          ref={pantalla}
          className={`min-w-0 overflow-hidden bg-black text-white ${
            inmersivo ? 'fixed inset-0 z-50 flex flex-col' : 'relative rounded-xl'
          }`}
        >
          <div
            className={`relative w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full ${
              inmersivo ? 'min-h-0 flex-1' : 'aspect-video'
            }`}
          >
            <div ref={contenedor} className="absolute inset-0" />

            {/* En vivo, una capa transparente evita pausar o adelantar clickeando el video;
                mientras está silenciado, tocarla activa el sonido. */}
            {modo === 'vivo' &&
              (silenciado && listo ? (
                <button
                  type="button"
                  onClick={alternarSonido}
                  className="absolute inset-0 z-[5] cursor-pointer"
                  aria-label="Activar sonido"
                />
              ) : (
                <div className="absolute inset-0 z-[5]" aria-hidden="true" />
              ))}

            <span
              className={`absolute left-2 top-2 z-10 max-w-[60%] truncate rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider sm:left-3 sm:top-3 ${
                modo === 'vivo' ? 'bg-brand-600' : 'bg-slate-800/90'
              }`}
            >
              {modo === 'vivo' ? `Repetición${enPantalla?.fecha ? ` · ${fechaCorta(enPantalla.fecha)}` : ''}` : 'On demand'}
            </span>

            {modo === 'vod' && (
              <button
                type="button"
                onClick={volverAlVivo}
                className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs font-semibold hover:bg-slate-950 sm:right-3 sm:top-3"
              >
                <SignalIcon className="h-4 w-4" aria-hidden="true" /> Volver a la TV
              </button>
            )}

            {repitiendo && (
              <span className="absolute left-1/2 top-10 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/80 px-2 py-0.5 text-xs font-bold uppercase tracking-wider sm:top-3">
                Cámara lenta
              </span>
            )}

            {silenciado && listo && !noDisponible && (
              <button
                type="button"
                onClick={alternarSonido}
                className={`absolute left-2 z-10 flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold hover:bg-slate-950 sm:left-3 ${
                  modo === 'vod' ? 'bottom-14' : 'bottom-2 sm:bottom-3'
                }`}
              >
                <SpeakerXMarkIcon className="h-4 w-4" aria-hidden="true" /> Tocá para activar el sonido
              </button>
            )}

            {modo === 'vivo' && proxima && restante < AVISO_PROXIMO_MS && !noDisponible && (
              <div className="absolute bottom-2 right-2 z-10 max-w-[45%] rounded-lg bg-slate-950/90 px-3 py-2 text-right text-sm shadow-lg sm:bottom-3 sm:right-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">A continuación</p>
                <p className="truncate font-semibold">{titulo(proxima.video)}</p>
              </div>
            )}

            {noDisponible && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950 p-4 text-center">
                <p className="font-semibold">Este video no está disponible.</p>
                {modo === 'vivo' ? (
                  <p className="text-sm text-slate-300">
                    {proxima ? `A las ${hora(proxima.desde)}: ${titulo(proxima.video)}` : 'Sigue en un momento.'}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={volverAlVivo}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold hover:bg-brand-700"
                  >
                    Volver a la TV
                  </button>
                )}
              </div>
            )}
          </div>

          {enPantalla && (
            <div
              className={`flex min-w-0 bg-slate-900 ${
                inmersivo ? 'items-center gap-2 px-2 py-1' : 'flex-col gap-2 px-3 py-3 sm:px-4'
              }`}
            >
              <div className="min-w-0 flex-1">
                <Marcador video={enPantalla} mostrarResultado={mostrarResultado} />
                {!inmersivo && <p className="mt-1 truncate text-center text-xs text-slate-400">{subtitulo(enPantalla)}</p>}
              </div>
              <div
                className={`flex shrink-0 items-center gap-1 ${
                  inmersivo ? '' : 'justify-between border-t border-white/10 pt-2'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMostrarResultado((v) => !v)}
                  className="h-11 rounded-lg px-3 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  aria-pressed={mostrarResultado}
                >
                  {mostrarResultado ? 'Ocultar resultado' : 'Resultado'}
                </button>
                <div className="relative flex items-center">
                  {copiado && (
                    <span
                      role="status"
                      className="absolute -top-8 left-0 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-xs font-semibold"
                    >
                      ¡Link copiado!
                    </span>
                  )}
                  <BotonIcono onClick={compartir} aria-label="Compartir este partido" title="Compartir">
                    <ShareIcon className="h-5 w-5" aria-hidden="true" />
                  </BotonIcono>
                  <BotonIcono
                    onClick={repetir}
                    disabled={!listo || repitiendo}
                    aria-label="Repetición: últimos 10 segundos en cámara lenta"
                    title="Repetición (últimos 10 s en cámara lenta)"
                  >
                    <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
                  </BotonIcono>
                  <BotonIcono onClick={alternarSonido} aria-label={silenciado ? 'Activar sonido' : 'Silenciar'}>
                    {silenciado ? (
                      <SpeakerXMarkIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </BotonIcono>
                  {!apaisado && (
                    <BotonIcono
                      onClick={pantallaCompleta}
                      aria-label={expandido ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    >
                      {expandido ? (
                        <ArrowsPointingInIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <ArrowsPointingOutIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </BotonIcono>
                  )}
                </div>
              </div>
              {!inmersivo && esPartido(enPantalla) && (
                <Link
                  to={`/partidos/${enPantalla._id}`}
                  className="border-t border-white/10 pt-2 text-center text-sm font-semibold text-brand-300 hover:underline"
                >
                  Ver ficha del partido →
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white lg:max-h-[36rem]">
          <div role="tablist" aria-label="Programación" className="flex border-b border-slate-200">
            {(
              [
                ['guia', 'Guía'],
                ['ondemand', 'On demand'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pestana === id}
                onClick={() => setPestana(id)}
                className={`min-h-11 flex-1 px-4 py-2.5 text-sm font-semibold ${
                  pestana === id ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="min-w-0 p-2 lg:overflow-y-auto">
            {pestana === 'guia' ? (
              <ol>
                {emisiones.map((e) => {
                  const esActual = actual !== null && e.desde === actual.desde;
                  const yaPaso = e.hasta <= ahora;
                  return (
                    <li key={`${e.desde}-${e.video._id}`}>
                      <button
                        type="button"
                        onClick={() => (esActual ? volverAlVivo() : verOnDemand(e.video._id))}
                        className={`flex w-full min-w-0 gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 ${
                          esActual ? 'bg-red-50' : ''
                        }`}
                      >
                        <span className={`w-12 shrink-0 tabular-nums ${yaPaso ? 'text-slate-500' : 'text-slate-700'}`}>
                          {hora(e.desde)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate font-semibold ${yaPaso ? 'text-slate-500' : 'text-slate-900'}`}>
                            {titulo(e.video)}
                          </span>
                          <span className="block truncate text-xs text-slate-600">{subtitulo(e.video)}</span>
                          {esActual && (
                            <span className="mt-1 block h-1 overflow-hidden rounded bg-red-100">
                              <span
                                className="block h-full bg-red-600"
                                style={{ width: `${Math.min(100, ((ahora - e.desde) / (e.hasta - e.desde)) * 100)}%` }}
                              />
                            </span>
                          )}
                        </span>
                        {esActual && <span className="shrink-0 text-xs font-bold text-red-600">AHORA</span>}
                        {yaPaso && <span className="shrink-0 text-xs font-semibold text-brand-700">Ver</span>}
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <ul>
                {catalogoCanal.map((v) => (
                  <li key={v._id}>
                    <button
                      type="button"
                      onClick={() => verOnDemand(v._id)}
                      className={`w-full min-w-0 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 ${
                        vod?._id === v._id ? 'bg-brand-50' : ''
                      }`}
                    >
                      <span className="block truncate font-semibold text-slate-900">{titulo(v)}</span>
                      <span className="block truncate text-xs text-slate-600">
                        {subtitulo(v)} · {Math.round(v.duracion / 60)} min
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TvPage;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowsPointingOutIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TvIcon,
} from '@heroicons/react/24/solid';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';
import { extraerYoutubeId } from '../../../shared/utils/youtube';
import {
  cargarYoutubeIframeApi,
  extraerInicioYoutube,
  type YTPlayer,
} from '../../../shared/utils/youtubeIframeApi';

/**
 * Overtime TV: un canal lineal con los partidos que tienen video. Abrís la página y ya está
 * pasando algo; cuando un video termina entra una placa de "a continuación" y arranca el
 * siguiente. Los links rotos o privados se saltean solos.
 *
 * Los canales son filtros por competencia (`?canal=<nombre>`), así la URL sirve para dejar
 * una TV fija en un torneo.
 */

const SEGUNDOS_TRANSICION = 6;

interface ItemTv {
  partido: Partido;
  id: string;
  videoId: string;
  inicio: number;
  competencia: string;
}

const nombreDe = (x: unknown): string =>
  x && typeof x === 'object' && 'nombre' in x ? String((x as { nombre?: string }).nombre ?? '') : '';

const aItem = (p: Partido): ItemTv | null => {
  const videoId = extraerYoutubeId(p.videoUrl);
  if (!videoId) return null;
  return {
    partido: p,
    id: String(p._id ?? p.id),
    videoId,
    inicio: extraerInicioYoutube(p.videoUrl),
    competencia: nombreDe(p.competencia) || 'Amistosos',
  };
};

const mezclar = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const formatearFecha = (fecha?: string) =>
  fecha
    ? new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

const Escudo: React.FC<{ src?: string; nombre: string; className?: string }> = ({ src, nombre, className = 'h-8 w-8' }) =>
  src ? (
    <img src={src} alt="" className={`${className} rounded-full bg-white object-contain`} />
  ) : (
    <span
      aria-hidden="true"
      className={`${className} flex items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white`}
    >
      {nombre.slice(0, 2).toUpperCase()}
    </span>
  );

const Enfrentamiento: React.FC<{ item: ItemTv; mostrarResultado: boolean; grande?: boolean }> = ({
  item,
  mostrarResultado,
  grande,
}) => {
  const { partido } = item;
  const local = partido.equipoLocal?.nombre ?? 'Local';
  const visitante = partido.equipoVisitante?.nombre ?? 'Visitante';
  const hayResultado =
    mostrarResultado && typeof partido.marcadorLocal === 'number' && typeof partido.marcadorVisitante === 'number';
  const escudo = grande ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-8 w-8';
  const texto = grande ? 'text-xl sm:text-3xl' : 'text-sm sm:text-base';

  return (
    <div className={`flex items-center justify-center ${grande ? 'gap-6' : 'gap-3'}`}>
      <div className={`flex items-center ${grande ? 'flex-col gap-2' : 'gap-2'} min-w-0`}>
        <Escudo src={partido.equipoLocal?.escudo} nombre={local} className={escudo} />
        <span className={`${texto} truncate font-semibold`}>{local}</span>
      </div>
      <span className={`${texto} shrink-0 font-bold tabular-nums text-brand-300`}>
        {hayResultado ? `${partido.marcadorLocal} – ${partido.marcadorVisitante}` : 'vs'}
      </span>
      <div className={`flex items-center ${grande ? 'flex-col gap-2' : 'flex-row-reverse gap-2'} min-w-0`}>
        <Escudo src={partido.equipoVisitante?.escudo} nombre={visitante} className={escudo} />
        <span className={`${texto} truncate font-semibold`}>{visitante}</span>
      </div>
    </div>
  );
};

const subtitulo = (item: ItemTv) =>
  [item.competencia, nombreDe(item.partido.fase), formatearFecha(item.partido.fecha)].filter(Boolean).join(' · ');

const TvPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const canal = searchParams.get('canal') ?? '';

  const { data: partidos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tv', 'partidos-con-video'],
    queryFn: () => PartidoService.getAll({ conVideo: true }),
    staleTime: 1000 * 60 * 30,
  });

  const items = useMemo(() => partidos.map(aItem).filter((x): x is ItemTv => x !== null), [partidos]);

  // Canales ordenados por cantidad de videos: el torneo con más material va primero.
  const canales = useMemo(() => {
    const conteo = new Map<string, number>();
    items.forEach((i) => conteo.set(i.competencia, (conteo.get(i.competencia) ?? 0) + 1));
    return Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const [rotos, setRotos] = useState<Set<string>>(() => new Set());
  const [vuelta, setVuelta] = useState(0);

  // La cola se mezcla al cambiar de canal o al terminar una vuelta completa: aleatorio, pero
  // sin repetir un partido hasta haber pasado todos.
  const cola = useMemo(() => {
    const delCanal = items.filter((i) => (!canal || i.competencia === canal) && !rotos.has(i.id));
    return mezclar(delCanal);
    // `rotos` queda afuera a propósito: sacar un link roto no debe re-mezclar lo que falta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, canal, vuelta]);

  const [indice, setIndice] = useState(0);
  const [enTransicion, setEnTransicion] = useState(false);
  const [silenciado, setSilenciado] = useState(true);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  useEffect(() => {
    setIndice(0);
    setEnTransicion(false);
  }, [cola]);

  const actual: ItemTv | undefined = cola[indice];
  const siguientes = useMemo(() => {
    const resto = cola.slice(indice + 1).filter((i) => !rotos.has(i.id));
    return resto.slice(0, 5);
  }, [cola, indice, rotos]);

  const avanzar = useCallback(() => {
    setEnTransicion(false);
    let i = indice + 1;
    while (i < cola.length && rotos.has(cola[i].id)) i++;
    if (i >= cola.length) setVuelta((v) => v + 1);
    else setIndice(i);
  }, [indice, cola, rotos]);

  // Los callbacks del player se registran una sola vez; leen la versión vigente por ref.
  const alTerminarRef = useRef<() => void>(() => {});
  const alFallarRef = useRef<() => void>(() => {});
  alTerminarRef.current = () => setEnTransicion(true);
  alFallarRef.current = () => {
    if (actual) {
      // Queda registrado en consola para poder limpiar el link después.
      console.warn('[Overtime TV] video no reproducible, se saltea', actual.id, actual.partido.videoUrl);
      setRotos((prev) => new Set(prev).add(actual.id));
    }
    avanzar();
  };

  useEffect(() => {
    if (!enTransicion) return;
    const t = window.setTimeout(avanzar, SEGUNDOS_TRANSICION * 1000);
    return () => window.clearTimeout(t);
  }, [enTransicion, avanzar]);

  // --- Player -----------------------------------------------------------------------------
  const contenedorPlayer = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [playerListo, setPlayerListo] = useState(false);
  const [errorApi, setErrorApi] = useState(false);
  const primerVideo = actual?.videoId;
  const primerInicio = actual?.inicio ?? 0;

  useEffect(() => {
    if (!primerVideo || player.current || !contenedorPlayer.current) return;
    let cancelado = false;
    const destino = document.createElement('div');
    contenedorPlayer.current.appendChild(destino);

    cargarYoutubeIframeApi()
      .then((YT) => {
        if (cancelado) return;
        player.current = new YT.Player(destino, {
          host: 'https://www.youtube-nocookie.com',
          videoId: primerVideo,
          playerVars: {
            autoplay: 1,
            // Los navegadores sólo permiten autoplay sin sonido; el usuario lo activa con un clic.
            mute: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            start: primerInicio,
          },
          events: {
            onReady: () => setPlayerListo(true),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED) alTerminarRef.current();
            },
            onError: () => alFallarRef.current(),
          },
        });
      })
      .catch(() => !cancelado && setErrorApi(true));

    return () => {
      cancelado = true;
    };
    // Se crea una vez con el primer video; los siguientes se cargan con loadVideoById.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primerVideo]);

  useEffect(
    () => () => {
      player.current?.destroy();
      player.current = null;
    },
    [],
  );

  const cargado = useRef<string | null>(null);
  useEffect(() => {
    if (!playerListo || !player.current || !actual) return;
    // La clave incluye la vuelta: en un canal de un solo video, volver a empezar debe recargarlo.
    const clave = `${vuelta}-${indice}-${actual.id}`;
    if (cargado.current === null) {
      cargado.current = clave; // el primero ya vino en el constructor
      return;
    }
    if (cargado.current === clave) return;
    cargado.current = clave;
    player.current.loadVideoById({ videoId: actual.videoId, startSeconds: actual.inicio });
  }, [playerListo, actual, vuelta, indice]);

  const alternarSonido = () => {
    const p = player.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      p.playVideo();
      setSilenciado(false);
    } else {
      p.mute();
      setSilenciado(true);
    }
  };

  const pantalla = useRef<HTMLDivElement>(null);
  const pantallaCompleta = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void pantalla.current?.requestFullscreen?.();
  };

  const cambiarCanal = (nuevo: string) => {
    const next = new URLSearchParams(searchParams);
    if (nuevo) next.set('canal', nuevo);
    else next.delete('canal');
    setSearchParams(next, { replace: true });
  };

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

  const proximo = siguientes[0];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <TvIcon className="h-7 w-7 text-brand-600" aria-hidden="true" /> Overtime TV
        </h1>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Canal
          <select
            value={canal}
            onChange={(e) => cambiarCanal(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todo ({items.length})</option>
            {canales.map(([nombre, n]) => (
              <option key={nombre} value={nombre}>
                {nombre} ({n})
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div ref={pantalla} className="relative overflow-hidden rounded-xl bg-black text-white">
          <div className="relative aspect-video w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full">
            <div ref={contenedorPlayer} className="absolute inset-0" />

            {enTransicion && proximo && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-slate-950/95 p-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">A continuación</p>
                <Enfrentamiento item={proximo} mostrarResultado={false} grande />
                <p className="text-sm text-slate-300">{subtitulo(proximo)}</p>
                <button
                  type="button"
                  onClick={avanzar}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
                >
                  Ver ahora
                </button>
              </div>
            )}

            {silenciado && playerListo && !enTransicion && (
              <button
                type="button"
                onClick={alternarSonido}
                className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold shadow-lg hover:bg-brand-700"
              >
                <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" /> Activar sonido
              </button>
            )}
          </div>

          {actual && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Enfrentamiento item={actual} mostrarResultado={mostrarResultado} />
                <p className="mt-1 truncate text-center text-xs text-slate-400">{subtitulo(actual)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMostrarResultado((v) => !v)}
                  className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  aria-pressed={mostrarResultado}
                >
                  {mostrarResultado ? 'Ocultar resultado' : 'Ver resultado'}
                </button>
                <button
                  type="button"
                  onClick={alternarSonido}
                  className="rounded-lg p-2 hover:bg-white/10"
                  aria-label={silenciado ? 'Activar sonido' : 'Silenciar'}
                >
                  {silenciado ? (
                    <SpeakerXMarkIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={avanzar}
                  className="rounded-lg p-2 hover:bg-white/10"
                  aria-label="Pasar al siguiente partido"
                >
                  <ForwardIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={pantallaCompleta}
                  className="rounded-lg p-2 hover:bg-white/10"
                  aria-label="Pantalla completa"
                >
                  <ArrowsPointingOutIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">A continuación</h2>
          {siguientes.length === 0 ? (
            <p className="text-sm text-slate-600">Al terminar este partido, la programación vuelve a empezar.</p>
          ) : (
            <ol className="space-y-3">
              {siguientes.map((item) => (
                <li key={item.id} className="text-sm">
                  <p className="font-semibold text-slate-900">
                    {item.partido.equipoLocal?.nombre ?? 'Local'} vs {item.partido.equipoVisitante?.nombre ?? 'Visitante'}
                  </p>
                  <p className="text-xs text-slate-600">{subtitulo(item)}</p>
                </li>
              ))}
            </ol>
          )}
          {actual && (
            <Link
              to={`/partidos/${actual.id}`}
              className="mt-4 block text-sm font-semibold text-brand-700 hover:underline"
            >
              Ver ficha del partido actual →
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TvPage;

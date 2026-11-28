import React from 'react';
import type { VivoTv } from '../programacion';

type Props = {
  vivos: VivoTv[];
  /** videoId de la señal elegida (si no está entre los vivos, se muestra la primera). */
  senal: string | null;
  onSenal: (videoId: string) => void;
  /** Volver a la programación grabada del canal, si tiene. */
  onVerGrabado?: () => void;
};

const haceCuanto = (desde: string | null) => {
  if (!desde) return null;
  const min = Math.round((Date.now() - new Date(desde).getTime()) / 60000);
  if (!(min >= 1)) return 'recién empezó';
  return min < 60 ? `hace ${min} min` : `hace ${Math.floor(min / 60)} h ${min % 60} min`;
};

/**
 * Transmisión en vivo de YouTube dentro de Overtime TV. Es el reproductor de YouTube tal cual
 * (con sus controles): un vivo no se sincroniza con la grilla, cada uno lo ve en directo.
 * Con varias transmisiones al mismo tiempo, se elige la señal.
 */
const EnVivo: React.FC<Props> = ({ vivos, senal, onSenal, onVerGrabado }) => {
  const actual = vivos.find((v) => v.videoId === senal) ?? vivos[0];
  if (!actual) return null;
  const detalle = [
    actual.canalYoutube,
    haceCuanto(actual.desde),
    actual.espectadores ? `${actual.espectadores.toLocaleString('es-AR')} mirando` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 overflow-hidden rounded-xl bg-black text-white">
        <div className="relative aspect-video w-full">
          <iframe
            key={actual.videoId}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${actual.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`}
            title={`En vivo: ${actual.titulo}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <span className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wider sm:left-3 sm:top-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" /> En vivo
          </span>
        </div>
        <div className="space-y-1 px-3 py-3 sm:px-4">
          <p className="truncate font-semibold">{actual.titulo}</p>
          {detalle && <p className="truncate text-xs text-slate-400">{detalle}</p>}
        </div>
      </div>

      <aside className="min-w-0 space-y-3">
        {vivos.length > 1 && (
          <section aria-labelledby="tv-senales" className="rounded-xl border border-slate-200 bg-white">
            <h2 id="tv-senales" className="border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
              {vivos.length} transmisiones en vivo
            </h2>
            <ul className="divide-y divide-slate-100">
              {vivos.map((v) => (
                <li key={v.videoId}>
                  <button
                    type="button"
                    onClick={() => onSenal(v.videoId)}
                    aria-current={v.videoId === actual.videoId}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 ${
                      v.videoId === actual.videoId ? 'bg-red-50' : ''
                    }`}
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${v.videoId}/mqdefault_live.jpg`}
                      alt=""
                      className="h-10 w-16 shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">{v.titulo}</span>
                      <span className="block truncate text-xs text-slate-600">{v.canalYoutube}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {onVerGrabado && (
          <button
            type="button"
            onClick={onVerGrabado}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ver la programación grabada
          </button>
        )}
      </aside>
    </div>
  );
};

export default EnVivo;

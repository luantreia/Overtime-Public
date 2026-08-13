import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { seccionesSimplificadas, diferenciasFormato } from '../data/reglasSimplificadas';
import { CourtDiagram3D as CourtDiagram, type CourtMode } from '../components/CourtDiagram3D';

// Cada sección de la explicación controla qué se dibuja en la cancha única de arriba.
const MODO_POR_TITULO: Record<string, CourtMode> = {
  '¿Cuál es el objetivo?': 'inicio',
  'La cancha': 'cancha',
  'Los equipos': 'equipos',
  'Así arranca un set': 'apertura',
  '¿Cómo quedás eliminado?': 'eliminado',
  'Volver a la cancha': 'volver',
  '¿Cómo se gana un set y el partido?': 'gana',
  'Juego limpio': 'limpio',
};

const ACENTOS = [
  { border: 'border-brand-100', badge: 'bg-brand-100 text-brand-700' },
  { border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700' },
  { border: 'border-rose-100', badge: 'bg-rose-100 text-rose-700' },
  { border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  { border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-700' },
  { border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700' },
  { border: 'border-sky-100', badge: 'bg-sky-100 text-sky-700' },
  { border: 'border-fuchsia-100', badge: 'bg-fuchsia-100 text-fuchsia-700' },
];

// Umbral mínimo de arrastre (px) para que un touch cuente como swipe y no como un toque/scroll vertical.
const SWIPE_THRESHOLD = 40;

const ComoSeJuegaPage: React.FC = () => {
  usePageTitle('Cómo se juega');
  const [abierta, setAbierta] = useState(0);
  const [formatoApertura, setFormatoApertura] = useState<'foam' | 'cloth'>('foam');
  const touchStartX = useRef<number | null>(null);

  const total = seccionesSimplificadas.length;
  const seccionActiva = seccionesSimplificadas[abierta];
  const modoActivo = MODO_POR_TITULO[seccionActiva?.titulo] || 'inicio';
  const acentoActivo = ACENTOS[abierta % ACENTOS.length];

  const irA = (i: number) => setAbierta(((i % total) + total) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD) irA(abierta - 1);
    else if (delta < -SWIPE_THRESHOLD) irA(abierta + 1);
  };

  return (
    <div className="mx-auto max-w-md space-y-5 sm:max-w-lg">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 px-4 py-4 text-white shadow-lg">
        <h1 className="text-xl font-black tracking-tight">🏐 ¿Cómo se juega al dodgeball?</h1>
        <p className="mt-1 text-sm text-brand-50">
          Lo esencial, en criollo. Deslizá para pasar de tema, o tocá uno de los íconos.{' '}
          <Link to="/reglamento" className="font-semibold text-white underline underline-offset-2">
            Reglamento oficial completo acá
          </Link>
          .
        </p>
      </div>

      {/* Selector de tema: fila de íconos con scroll propio, siempre a mano del pulgar */}
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {seccionesSimplificadas.map((seccion, i) => {
          const acento = ACENTOS[i % ACENTOS.length];
          const isActive = abierta === i;
          return (
            <button
              key={seccion.titulo}
              type="button"
              onClick={() => setAbierta(i)}
              aria-pressed={isActive}
              aria-label={seccion.titulo}
              className={`flex shrink-0 snap-start items-center justify-center rounded-full border text-lg transition-colors ${
                isActive ? `${acento.badge} border-transparent shadow-sm` : 'border-slate-200 bg-white text-slate-500'
              }`}
              style={{ width: 44, height: 44 }}
            >
              <span aria-hidden="true">{seccion.emoji}</span>
            </button>
          );
        })}
      </div>

      {/* Widget principal: cancha arriba, texto abajo — nunca lado a lado, para que ambos
          se lean cómodos con el pulgar sin achicar la cancha a un tamaño ilegible. */}
      <div
        className="touch-pan-y rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="mx-auto w-full max-w-[240px]">
          <CourtDiagram mode={modoActivo} formato={formatoApertura} className="w-full" />
        </div>

        {modoActivo === 'apertura' && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className={`text-xs font-bold ${formatoApertura === 'cloth' ? 'text-amber-700' : 'text-slate-400'}`}>
              Cloth
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={formatoApertura === 'foam'}
              aria-label="Cambiar entre formato Cloth y Foam"
              onClick={() => setFormatoApertura((f) => (f === 'foam' ? 'cloth' : 'foam'))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                formatoApertura === 'foam' ? 'bg-sky-500' : 'bg-amber-500'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  formatoApertura === 'foam' ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${formatoApertura === 'foam' ? 'text-sky-700' : 'text-slate-400'}`}>
              Foam
            </span>
          </div>
        )}

        {seccionActiva && (
          <div className={`mt-4 rounded-xl border ${acentoActivo.border} bg-white p-4`}>
            <h2 className="text-base font-bold text-slate-900">{seccionActiva.titulo}</h2>
            <div className="mt-2 space-y-2">
              {seccionActiva.parrafos.map((parrafo, j) => (
                <p key={j} className="text-sm leading-relaxed text-slate-600">
                  {parrafo}
                </p>
              ))}
            </div>
            {seccionActiva.bullets && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                {seccionActiva.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Navegación: botones grandes para el pulgar + puntos de progreso. El swipe en el widget
            hace lo mismo, esto es para quien prefiere tocar en vez de deslizar. */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => irA(abierta - 1)}
            aria-label="Tema anterior"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 active:bg-slate-100"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {seccionesSimplificadas.map((seccion, i) => (
              <button
                key={seccion.titulo}
                type="button"
                onClick={() => irA(i)}
                aria-label={`Ir a: ${seccion.titulo}`}
                aria-current={abierta === i}
                className={`h-1.5 rounded-full transition-all ${abierta === i ? 'w-5 bg-brand-600' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => irA(abierta + 1)}
            aria-label="Siguiente tema"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 active:bg-slate-100"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-bold text-slate-900">🥊 Cloth vs. Foam</h2>
        <p className="mt-1 text-sm text-slate-600">
          Overtime organiza competencias en las dos modalidades oficiales. Comparten objetivo y cancha, pero
          difieren en la pelota y en cómo evitan que un equipo se quede con todas.
        </p>
        <div className="mt-3 space-y-3">
          {diferenciasFormato.map((fila) => (
            <div key={fila.aspecto} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{fila.aspecto}</p>
              <div className="mt-2 space-y-2">
                <div className="rounded-lg bg-amber-50 p-2.5">
                  <span className="text-xs font-bold text-amber-700">🧵 Cloth</span>
                  <p className="mt-0.5 text-sm text-slate-700">{fila.cloth}</p>
                </div>
                <div className="rounded-lg bg-sky-50 p-2.5">
                  <span className="text-xs font-bold text-sky-700">🟠 Foam</span>
                  <p className="mt-0.5 text-sm text-slate-700">{fila.foam}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-4 text-center">
        <h2 className="text-base font-bold text-slate-900">¿Ya entendiste lo básico?</h2>
        <p className="mt-1 text-sm text-slate-600">Buscá un partido cerca tuyo o anotate para jugar tu primer set.</p>
        <div className="mt-3 flex flex-col gap-2.5">
          <Link
            to="/plaza"
            className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition active:bg-brand-700"
          >
            Buscar un partido en La Plaza
          </Link>
          <Link
            to="/reglamento"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition active:bg-slate-50"
          >
            Ver el reglamento completo
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ComoSeJuegaPage;

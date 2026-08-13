import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { escenasExplicadas, diferenciasFormato } from '../data/reglasSimplificadas';
import { CourtDiagram3D, type Formato } from '../components/CourtDiagram3D';

const ACENTOS = [
  { border: 'border-brand-100', badge: 'bg-brand-100 text-brand-700' },
  { border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700' },
  { border: 'border-rose-100', badge: 'bg-rose-100 text-rose-700' },
  { border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  { border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-700' },
  { border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700' },
  { border: 'border-sky-100', badge: 'bg-sky-100 text-sky-700' },
];

// Umbral mínimo de arrastre (px) para que un touch cuente como swipe y no como toque o scroll.
const SWIPE_THRESHOLD = 40;

const REFERENCIAS = [
  { color: 'bg-red-600', texto: 'Equipo rojo' },
  { color: 'bg-blue-600', texto: 'Equipo azul' },
  { color: 'bg-red-400', texto: 'Shaggers' },
  { color: 'bg-slate-400', texto: 'Eliminados' },
  { color: 'bg-orange-500', texto: 'Pelota' },
];

const ComoSeJuegaPage: React.FC = () => {
  usePageTitle('Cómo se juega');
  const [abierta, setAbierta] = useState(0);
  const [formato, setFormato] = useState<Formato>('foam');
  const [corriendo, setCorriendo] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  const [reinicio, setReinicio] = useState(0);
  const [nota, setNota] = useState('');
  const touchStartX = useRef<number | null>(null);

  const total = escenasExplicadas.length;
  const escena = escenasExplicadas[abierta];
  const acento = ACENTOS[abierta % ACENTOS.length];

  const irA = (i: number) => setAbierta(((i % total) + total) % total);
  const manejarNota = useCallback((n: string) => setNota(n), []);

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
    <div className="mx-auto max-w-md space-y-5 sm:max-w-xl">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 px-4 py-4 text-white shadow-lg">
        <h1 className="text-xl font-black tracking-tight">🏐 ¿Cómo se juega al dodgeball?</h1>
        <p className="mt-1 text-sm text-brand-50">
          Siete jugadas animadas. Deslizá para pasar de una a otra.{' '}
          <Link to="/reglamento" className="font-semibold text-white underline underline-offset-2">
            Reglamento oficial completo acá
          </Link>
          .
        </p>
      </div>

      {/* El formato manda en toda la página: cambia el reparto de pelotas, las líneas y los puntos. */}
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setFormato('cloth')}
          aria-pressed={formato === 'cloth'}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
            formato === 'cloth' ? 'bg-amber-100 text-amber-800' : 'text-slate-400'
          }`}
        >
          🧵 Cloth
        </button>
        <span className="text-xs text-slate-300">|</span>
        <button
          type="button"
          onClick={() => setFormato('foam')}
          aria-pressed={formato === 'foam'}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
            formato === 'foam' ? 'bg-sky-100 text-sky-800' : 'text-slate-400'
          }`}
        >
          🟠 Foam
        </button>
      </div>

      {/* Selector de jugada: fila de íconos con scroll propio, siempre a mano del pulgar */}
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {escenasExplicadas.map((item, i) => {
          const acentoItem = ACENTOS[i % ACENTOS.length];
          const isActive = abierta === i;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setAbierta(i)}
              aria-pressed={isActive}
              aria-label={item.titulo}
              className={`flex shrink-0 snap-start items-center justify-center rounded-full border text-lg transition-colors ${
                isActive ? `${acentoItem.badge} border-transparent shadow-sm` : 'border-slate-200 bg-white text-slate-500'
              }`}
              style={{ width: 44, height: 44 }}
            >
              <span aria-hidden="true">{item.emoji}</span>
            </button>
          );
        })}
      </div>

      <div
        className="touch-pan-y rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <CourtDiagram3D
          mode={escena.id}
          formato={formato}
          corriendo={corriendo}
          reinicio={reinicio}
          onNota={manejarNota}
        />

        {/* Lo que va contando la animación, sincronizado con lo que se ve en la cancha */}
        <div className={`mt-2 flex min-h-[52px] items-center justify-center rounded-xl border ${acento.border} bg-slate-50/70 px-3 py-2`}>
          <p className="text-center text-sm font-medium leading-snug text-slate-700">{nota}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => irA(abierta - 1)}
            aria-label="Jugada anterior"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 active:bg-slate-100"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorriendo((v) => !v)}
              aria-label={corriendo ? 'Pausar la animación' : 'Reproducir la animación'}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white active:bg-brand-700"
            >
              {corriendo ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setReinicio((v) => v + 1)}
              aria-label="Volver a empezar la animación"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 active:bg-slate-100"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => irA(abierta + 1)}
            aria-label="Jugada siguiente"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 active:bg-slate-100"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5">
          {escenasExplicadas.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => irA(i)}
              aria-label={`Ir a: ${item.titulo}`}
              aria-current={abierta === i}
              className={`h-1.5 rounded-full transition-all ${abierta === i ? 'w-5 bg-brand-600' : 'w-1.5 bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <section className={`rounded-2xl border ${acento.border} bg-white p-4`}>
        <h2 className="text-base font-bold text-slate-900">
          {escena.emoji} {escena.titulo}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{escena.resumen}</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
          {REFERENCIAS.map((ref) => (
            <li key={ref.texto} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-2.5 w-2.5 rounded-full ${ref.color}`} aria-hidden="true" />
              {ref.texto}
            </li>
          ))}
        </ul>
      </section>

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
                <div className={`rounded-lg p-2.5 ${formato === 'cloth' ? 'bg-amber-100' : 'bg-amber-50'}`}>
                  <span className="text-xs font-bold text-amber-700">🧵 Cloth</span>
                  <p className="mt-0.5 text-sm text-slate-700">{fila.cloth}</p>
                </div>
                <div className={`rounded-lg p-2.5 ${formato === 'foam' ? 'bg-sky-100' : 'bg-sky-50'}`}>
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

import React, { useState } from 'react';
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

const ComoSeJuegaPage: React.FC = () => {
  usePageTitle('Cómo se juega');
  const [abierta, setAbierta] = useState(0);
  const [formatoApertura, setFormatoApertura] = useState<'foam' | 'cloth'>('foam');

  const total = seccionesSimplificadas.length;
  const seccionActiva = seccionesSimplificadas[abierta];
  const modoActivo = MODO_POR_TITULO[seccionActiva?.titulo] || 'inicio';
  const acentoActivo = ACENTOS[abierta % ACENTOS.length];

  const irA = (i: number) => setAbierta(((i % total) + total) % total);

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 px-4 py-3 text-white shadow-lg sm:rounded-3xl sm:p-8">
        <h1 className="text-lg font-black tracking-tight sm:text-3xl">🏐 ¿Cómo se juega al dodgeball?</h1>
        <p className="mt-1 hidden text-sm text-brand-50 sm:mt-2 sm:block sm:text-base">
          Lo esencial para entender un partido, en criollo. Elegí un tema y mirá cómo cambia la cancha. Si
          querés el reglamento oficial completo,{' '}
          <Link to="/reglamento" className="font-semibold text-white underline underline-offset-2 hover:text-brand-100">
            está acá
          </Link>
          .
        </p>
      </div>

      {/* Widget interactivo: cancha + texto van en fila incluso en mobile, para que entren
          juntos en la pantalla sin tener que hacer scroll para pasar de uno al otro. */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
        {/* Selector rápido de tema: tira horizontal con scroll propio, nunca empuja el resto hacia abajo */}
        <div className="-mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-2">
          {seccionesSimplificadas.map((seccion, i) => {
            const acento = ACENTOS[i % ACENTOS.length];
            const isActive = abierta === i;
            return (
              <button
                key={seccion.titulo}
                type="button"
                onClick={() => setAbierta(i)}
                aria-pressed={isActive}
                title={seccion.titulo}
                className={`flex shrink-0 snap-start items-center justify-center rounded-full border text-base transition-colors sm:hidden ${
                  isActive ? `${acento.badge} border-transparent shadow-sm` : 'border-slate-200 bg-white text-slate-500'
                }`}
                style={{ width: 34, height: 34 }}
              >
                <span aria-hidden="true">{seccion.emoji}</span>
              </button>
            );
          })}
          {/* Versión con texto para pantallas más anchas */}
          {seccionesSimplificadas.map((seccion, i) => {
            const acento = ACENTOS[i % ACENTOS.length];
            const isActive = abierta === i;
            return (
              <button
                key={`wide-${seccion.titulo}`}
                type="button"
                onClick={() => setAbierta(i)}
                aria-pressed={isActive}
                className={`hidden shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors sm:flex ${
                  isActive
                    ? `${acento.badge} border-transparent shadow-sm`
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span aria-hidden="true">{seccion.emoji}</span>
                {seccion.titulo}
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-3 sm:grid sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-6">
          {/* Cancha: achicada en mobile para que quepa al lado del texto */}
          <div className="shrink-0">
            <CourtDiagram
              mode={modoActivo}
              formato={formatoApertura}
              className="w-[120px] xs:w-[150px] sm:w-full sm:max-w-[220px]"
            />
            {modoActivo === 'apertura' && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5 sm:mt-3 sm:gap-3">
                <span className={`text-[10px] font-bold sm:text-xs ${formatoApertura === 'cloth' ? 'text-amber-700' : 'text-slate-400'}`}>
                  Cloth
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formatoApertura === 'foam'}
                  aria-label="Cambiar entre formato Cloth y Foam"
                  onClick={() => setFormatoApertura((f) => (f === 'foam' ? 'cloth' : 'foam'))}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors sm:h-6 sm:w-11 ${
                    formatoApertura === 'foam' ? 'bg-sky-500' : 'bg-amber-500'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform sm:h-5 sm:w-5 ${
                      formatoApertura === 'foam' ? 'translate-x-[18px] sm:translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-bold sm:text-xs ${formatoApertura === 'foam' ? 'text-sky-700' : 'text-slate-400'}`}>
                  Foam
                </span>
              </div>
            )}
          </div>

          {/* Panel de texto de la sección elegida, al lado de la cancha siempre */}
          {seccionActiva && (
            <div className={`min-w-0 flex-1 rounded-xl border ${acentoActivo.border} bg-white p-3 sm:rounded-2xl sm:p-5`}>
              <h2 className="text-sm font-bold text-slate-900 sm:text-lg">{seccionActiva.titulo}</h2>
              <div className="mt-1.5 space-y-1.5 sm:mt-2 sm:space-y-2">
                {seccionActiva.parrafos.map((parrafo, j) => (
                  <p key={j} className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {parrafo}
                  </p>
                ))}
              </div>
              {seccionActiva.bullets && (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600 sm:mt-3 sm:space-y-1.5 sm:pl-5 sm:text-sm">
                  {seccionActiva.bullets.map((bullet, j) => (
                    <li key={j}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Navegación guiada: paso a paso, para quien prefiere seguir el orden en vez de saltar temas */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 sm:mt-4 sm:pt-3">
          <button
            type="button"
            onClick={() => irA(abierta - 1)}
            aria-label="Tema anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 sm:h-9 sm:w-9"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {seccionesSimplificadas.map((seccion, i) => (
              <button
                key={seccion.titulo}
                type="button"
                onClick={() => irA(i)}
                aria-label={`Ir a: ${seccion.titulo}`}
                aria-current={abierta === i}
                className={`h-1.5 rounded-full transition-all ${abierta === i ? 'w-4 bg-brand-600' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => irA(abierta + 1)}
            aria-label="Siguiente tema"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 sm:h-9 sm:w-9"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">🥊 Cloth vs. Foam: dos modalidades, una idea</h2>
        <p className="mt-1 text-sm text-slate-600">
          Overtime organiza competencias en las dos modalidades oficiales. Comparten el mismo objetivo y la misma
          cancha, pero difieren en la pelota y en cómo se evita que un equipo se quede sentado sobre todas las
          pelotas.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Aspecto</th>
                <th className="rounded-t-lg bg-amber-50 px-3 py-2 text-amber-700">🧵 Cloth</th>
                <th className="rounded-t-lg bg-sky-50 px-3 py-2 text-sky-700">🟠 Foam</th>
              </tr>
            </thead>
            <tbody>
              {diferenciasFormato.map((fila, i) => (
                <tr key={fila.aspecto} className={i % 2 === 0 ? 'bg-slate-50/60' : ''}>
                  <td className="py-3 pr-4 align-top font-semibold text-slate-800">{fila.aspecto}</td>
                  <td className="px-3 py-3 align-top text-slate-600">{fila.cloth}</td>
                  <td className="px-3 py-3 align-top text-slate-600">{fila.foam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-6 text-center">
        <h2 className="text-lg font-bold text-slate-900">¿Ya entendiste lo básico?</h2>
        <p className="mt-1 text-sm text-slate-600">Buscá un partido cerca tuyo o anotate para jugar tu primer set.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            to="/plaza"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Buscar un partido en La Plaza
          </Link>
          <Link
            to="/reglamento"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ver el reglamento completo
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ComoSeJuegaPage;

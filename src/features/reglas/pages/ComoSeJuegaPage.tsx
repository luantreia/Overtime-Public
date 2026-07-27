import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const seccionActiva = seccionesSimplificadas[abierta];
  const modoActivo = MODO_POR_TITULO[seccionActiva?.titulo] || 'inicio';

  const acentoActivo = ACENTOS[abierta % ACENTOS.length];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">🏐 ¿Cómo se juega al dodgeball?</h1>
        <p className="mt-2 text-brand-50">
          Lo esencial para entender un partido, en criollo. Elegí un tema y mirá cómo cambia la cancha. Si
          querés el reglamento oficial completo,{' '}
          <Link to="/reglamento" className="font-semibold text-white underline underline-offset-2 hover:text-brand-100">
            está acá
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        {/* Cancha: siempre visible, nunca tapada por los botones ni por el texto */}
        <div className="lg:sticky lg:top-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <CourtDiagram mode={modoActivo} formato={formatoApertura} />

            {modoActivo === 'apertura' && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className={`text-xs font-bold ${formatoApertura === 'cloth' ? 'text-amber-700' : 'text-slate-400'}`}>Cloth (5)</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formatoApertura === 'foam'}
                  onClick={() => setFormatoApertura((f) => (f === 'foam' ? 'cloth' : 'foam'))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${formatoApertura === 'foam' ? 'bg-sky-500' : 'bg-amber-500'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      formatoApertura === 'foam' ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${formatoApertura === 'foam' ? 'text-sky-700' : 'text-slate-400'}`}>Foam (6)</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Botones de tema: siempre todos accesibles, ninguno tapa la cancha al elegirse */}
          <div className="flex flex-wrap gap-2">
            {seccionesSimplificadas.map((seccion, i) => {
              const acento = ACENTOS[i % ACENTOS.length];
              const isActive = abierta === i;
              return (
                <button
                  key={seccion.titulo}
                  type="button"
                  onClick={() => setAbierta(i)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
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

          {/* Panel de la sección elegida */}
          {seccionActiva && (
            <div className={`rounded-2xl border ${acentoActivo.border} bg-white p-5 sm:p-6`}>
              <h2 className="text-lg font-bold text-slate-900">{seccionActiva.titulo}</h2>
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

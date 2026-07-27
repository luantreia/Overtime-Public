import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { seccionesSimplificadas, diferenciasFormato } from '../data/reglasSimplificadas';
import { CourtDiagram } from '../components/CourtDiagram';
import { IlustracionArrancada, IlustracionEliminacion, IlustracionAtajarYVolver } from '../components/RuleIllustrations';

// Ilustración opcional por sección, buscada por título. Mantiene la página friendly
// sin forzar una ilustración en cada tarjeta (algunas se explican mejor solo con texto).
const ILUSTRACION_POR_TITULO: Record<string, React.FC> = {
  'Así arranca un set': IlustracionArrancada,
  '¿Cómo quedás eliminado?': IlustracionEliminacion,
  'Volver a la cancha': IlustracionAtajarYVolver,
};

// Paleta de acentos que rota por tarjeta para que la página se sienta viva, no una lista gris.
const ACENTOS = [
  { bg: 'bg-brand-50', border: 'border-brand-100', badge: 'bg-brand-100 text-brand-700' },
  { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700' },
  { bg: 'bg-rose-50', border: 'border-rose-100', badge: 'bg-rose-100 text-rose-700' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-indigo-50', border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-700' },
  { bg: 'bg-orange-50', border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700' },
  { bg: 'bg-sky-50', border: 'border-sky-100', badge: 'bg-sky-100 text-sky-700' },
];

const ComoSeJuegaPage: React.FC = () => {
  usePageTitle('Cómo se juega');

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">🏐 ¿Cómo se juega al dodgeball?</h1>
        <p className="mt-2 text-brand-50">
          Lo esencial para entender un partido, en criollo y con dibujitos. Si querés el reglamento oficial completo,{' '}
          <Link to="/reglamento" className="font-semibold text-white underline underline-offset-2 hover:text-brand-100">
            está acá
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {seccionesSimplificadas.map((seccion, i) => {
          const acento = ACENTOS[i % ACENTOS.length];
          const Ilustracion = ILUSTRACION_POR_TITULO[seccion.titulo];
          const esCancha = seccion.titulo === 'La cancha';
          return (
            <section
              key={seccion.titulo}
              className={`rounded-2xl border ${acento.border} ${acento.bg} p-5 sm:p-6 flex flex-col ${esCancha ? 'sm:col-span-2' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${acento.badge}`} aria-hidden="true">
                  {seccion.emoji}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{seccion.titulo}</h2>
              </div>

              <div className={`mt-3 ${esCancha ? 'sm:flex sm:items-center sm:gap-6' : ''}`}>
                <div className={esCancha ? 'sm:flex-1' : ''}>
                  <div className="space-y-2">
                    {seccion.parrafos.map((parrafo, j) => (
                      <p key={j} className="text-sm leading-relaxed text-slate-600">
                        {parrafo}
                      </p>
                    ))}
                  </div>
                  {seccion.bullets && (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                      {seccion.bullets.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {esCancha && (
                  <div className="mt-4 sm:mt-0 sm:w-72 sm:shrink-0">
                    <CourtDiagram />
                  </div>
                )}
              </div>

              {Ilustracion && (
                <div className="mt-4 rounded-xl bg-white/70 p-3">
                  <Ilustracion />
                </div>
              )}
            </section>
          );
        })}
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

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { seccionesSimplificadas, diferenciasFormato } from '../data/reglasSimplificadas';

const ComoSeJuegaPage: React.FC = () => {
  usePageTitle('Cómo se juega');

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">¿Cómo se juega al dodgeball?</h1>
        <p className="mt-2 text-slate-600">
          Lo esencial para entender un partido, en criollo. Si querés el reglamento oficial completo,{' '}
          <Link to="/reglamento" className="font-medium text-brand-600 hover:underline">
            está acá
          </Link>
          .
        </p>
      </div>

      <div className="space-y-6">
        {seccionesSimplificadas.map((seccion) => (
          <section key={seccion.titulo} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span aria-hidden="true">{seccion.emoji}</span>
              {seccion.titulo}
            </h2>
            <div className="mt-2 space-y-2">
              {seccion.parrafos.map((parrafo, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-600">
                  {parrafo}
                </p>
              ))}
            </div>
            {seccion.bullets && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                {seccion.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Cloth vs. Foam: dos modalidades, una idea</h2>
        <p className="mt-1 text-sm text-slate-600">
          Overtime organiza competencias en las dos modalidades oficiales. Comparten el mismo objetivo y la misma
          cancha, pero difieren en la pelota y en cómo se evita que un equipo se quede sentado sobre todas las
          pelotas.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Aspecto</th>
                <th className="py-2 pr-4">Cloth</th>
                <th className="py-2">Foam</th>
              </tr>
            </thead>
            <tbody>
              {diferenciasFormato.map((fila) => (
                <tr key={fila.aspecto} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4 font-semibold text-slate-800">{fila.aspecto}</td>
                  <td className="py-3 pr-4 text-slate-600">{fila.cloth}</td>
                  <td className="py-3 text-slate-600">{fila.foam}</td>
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

import React, { useMemo, useState } from 'react';
import type { Reglamento } from '../types';
import ClausulaItem from './ClausulaItem';

interface ReglamentoViewerProps {
  reglamento: Reglamento;
}

const slugParte = (numero: string, titulo: string): string =>
  `${numero}-${titulo}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const ReglamentoViewer: React.FC<ReglamentoViewerProps> = ({ reglamento }) => {
  const [query, setQuery] = useState('');

  const partesFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reglamento.partes;
    return reglamento.partes
      .map((parte) => {
        const secciones = parte.secciones
          .map((seccion) => ({
            ...seccion,
            reglas: seccion.reglas.filter(
              (regla) => regla.titulo.toLowerCase().includes(q) || regla.numero.toLowerCase().includes(q)
            ),
          }))
          .filter((seccion) => seccion.reglas.length > 0);
        return { ...parte, secciones };
      })
      .filter((parte) => parte.secciones.length > 0 || parte.titulo.toLowerCase().includes(q));
  }, [query, reglamento.partes]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar una regla…"
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <nav className="hidden max-h-[70vh] flex-col gap-1 overflow-y-auto text-sm lg:flex">
          {reglamento.partes.map((parte) => (
            <a
              key={parte.numero}
              href={`#${slugParte(parte.numero, parte.titulo)}`}
              className="rounded-lg px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {parte.numero}: {parte.titulo}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 space-y-10">
        {partesFiltradas.length === 0 && (
          <p className="text-sm text-slate-500">No encontramos reglas que coincidan con "{query}".</p>
        )}
        {partesFiltradas.map((parte) => (
          <section key={parte.numero} id={slugParte(parte.numero, parte.titulo)} className="scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900">
              {parte.numero}: {parte.titulo}
            </h2>
            <div className="mt-4 space-y-6">
              {parte.secciones.map((seccion, si) => (
                <div key={si}>
                  {seccion.titulo && (
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">
                      {seccion.titulo}
                    </h3>
                  )}
                  <div className="space-y-4">
                    {seccion.reglas.map((regla, ri) => (
                      <div key={ri} className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="text-sm font-bold text-slate-900">
                          {regla.numero && <span className="mr-2 text-brand-600">Regla {regla.numero}</span>}
                          {regla.titulo}
                        </h4>
                        <div className="mt-1">
                          {regla.clausulas.map((clausula, ci) => (
                            <ClausulaItem key={ci} clausula={clausula} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ReglamentoViewer;

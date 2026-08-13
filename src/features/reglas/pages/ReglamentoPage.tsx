import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { ReglamentoViewer, FormatoToggle, PdfDocumentCard } from '../components';
import reglamentoCloth from '../data/reglamentoCloth';
import reglamentoFoam from '../data/reglamentoFoam';
import type { FormatoDodgeball } from '../types';

const REGLAMENTOS: Record<FormatoDodgeball, typeof reglamentoCloth> = {
  cloth: reglamentoCloth,
  foam: reglamentoFoam,
};

const ARCHIVOS_PDF: Record<FormatoDodgeball, string> = {
  foam: 'WDBF-Foam-Rules-2026.pdf',
  cloth: 'WDBF-Cloth-Rules-2026.pdf',
};

const ReglamentoPage: React.FC = () => {
  const [formato, setFormato] = useState<FormatoDodgeball>('foam');
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const reglamento = REGLAMENTOS[formato];
  usePageTitle(`Reglamento ${formato === 'cloth' ? 'Cloth' : 'Foam'}`);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Reglamento oficial</h1>
          <p className="mt-1 text-sm text-slate-600">
            Documento fuente de la World Dodgeball Federation, tal cual lo publican (en inglés). ¿Recién arrancás?{' '}
            <Link to="/como-se-juega" className="font-medium text-brand-600 hover:underline">
              Empezá por la versión simplificada
            </Link>
            .
          </p>
        </div>
        <FormatoToggle formato={formato} onChange={setFormato} />
      </div>

      <PdfDocumentCard
        formato={formato}
        archivo={ARCHIVOS_PDF[formato]}
        tituloDocumento={reglamento.tituloDocumento}
        fuente={reglamento.fuente}
      />

      <div className="rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setMostrarTexto((v) => !v)}
          aria-expanded={mostrarTexto}
          className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
        >
          <span>
            <span className="block text-sm font-bold text-slate-900 sm:text-base">
              Versión navegable con buscador
            </span>
            <span className="block text-xs text-slate-500 sm:text-sm">
              El mismo texto transcripto en formato de sitio, para buscar una regla puntual sin bajar el PDF. No
              reemplaza al documento oficial de arriba.
            </span>
          </span>
          <span
            className={`shrink-0 rounded-full border border-slate-200 p-1.5 text-slate-500 transition-transform ${mostrarTexto ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {mostrarTexto && (
          <div className="border-t border-slate-100 p-4 sm:p-5">
            <ReglamentoViewer reglamento={reglamento} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReglamentoPage;

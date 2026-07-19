import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { ReglamentoViewer, FormatoToggle } from '../components';
import reglamentoCloth from '../data/reglamentoCloth';
import reglamentoFoam from '../data/reglamentoFoam';
import type { FormatoDodgeball } from '../types';

const REGLAMENTOS: Record<FormatoDodgeball, typeof reglamentoCloth> = {
  cloth: reglamentoCloth,
  foam: reglamentoFoam,
};

const ReglamentoPage: React.FC = () => {
  const [formato, setFormato] = useState<FormatoDodgeball>('foam');
  const reglamento = REGLAMENTOS[formato];
  usePageTitle(`Reglamento ${formato === 'cloth' ? 'Cloth' : 'Foam'}`);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Reglamento oficial</h1>
          <p className="mt-1 text-sm text-slate-600">
            {reglamento.tituloDocumento} — texto oficial de la {reglamento.fuente}, en su idioma original (inglés).
            ¿Recién arrancás?{' '}
            <Link to="/como-se-juega" className="font-medium text-brand-600 hover:underline">
              Empezá por la versión simplificada
            </Link>
            .
          </p>
        </div>
        <FormatoToggle formato={formato} onChange={setFormato} />
      </div>

      <ReglamentoViewer reglamento={reglamento} />
    </div>
  );
};

export default ReglamentoPage;

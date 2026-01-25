import React from 'react';
import { type Competencia } from '../services/competenciaService';

interface CompetenciaInfoTabProps {
  competencia: Competencia;
}

export const CompetenciaInfoTab: React.FC<CompetenciaInfoTabProps> = ({ competencia }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Detalles de la Competencia</h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-slate-500">Fecha de Inicio</dt>
          <dd className="mt-1 text-sm text-slate-900">
            {competencia.fechaInicio ? new Date(competencia.fechaInicio).toLocaleDateString() : '-'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Fecha de Fin</dt>
          <dd className="mt-1 text-sm text-slate-900">
            {competencia.fechaFin ? new Date(competencia.fechaFin).toLocaleDateString() : '-'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Organización</dt>
          <dd className="mt-1 text-sm text-slate-900">
            {(competencia as any).organizacion?.nombre || 'N/A'}
          </dd>
        </div>
      </dl>
    </div>
  );
};

import React from 'react';
import { type Competencia } from '../services/competenciaService';

interface CompetenciaHeaderProps {
  competencia: Competencia;
  isRanked: boolean;
  onBack: () => void;
}

export const CompetenciaHeader: React.FC<CompetenciaHeaderProps> = ({ competencia, isRanked, onBack }) => {
  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-slate-200">
      <button onClick={onBack} className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        ← Volver
      </button>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{competencia.nombre}</h1>
          <p className="mt-1 text-slate-600">{competencia.descripcion || 'Sin descripción'}</p>
          <div className="mt-2 flex gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {(competencia as any).modalidad || 'General'}
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
              {(competencia as any).categoria || 'General'}
            </span>
            {isRanked && (
              <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                🏆 Ranked
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Estado</div>
          <div className="font-medium capitalize text-slate-900">{competencia.estado?.replace('_', ' ') || 'Desconocido'}</div>
        </div>
      </div>
    </div>
  );
};

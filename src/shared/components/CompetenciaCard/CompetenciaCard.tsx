import type { KeyboardEvent, ReactNode } from 'react';
import type { Competencia } from '../../../features/competencias/services/competenciaService';
import { formatDate } from '../../../utils/formatDate';

export interface CompetenciaCardProps {
  competencia: Competencia;
  variante?: 'proximamente' | 'en_curso' | 'finalizada';
  actions?: ReactNode;
  onClick?: () => void;
}

const badgeStyles = {
  proximamente: { label: 'Próxima', className: 'bg-sky-100 text-sky-700' },
  en_curso: { label: 'En curso', className: 'bg-emerald-100 text-emerald-700' },
  finalizada: { label: 'Finalizada', className: 'bg-slate-100 text-slate-500' },
} as const;

const statusDot = {
  proximamente: 'bg-sky-400',
  en_curso: 'bg-emerald-400 animate-pulse',
  finalizada: 'bg-slate-300',
} as const;

const CompetenciaCard = ({ competencia, variante = 'proximamente', actions, onClick }: CompetenciaCardProps) => {
  if (!competencia) return null;

  const validVariante = (variante && variante in badgeStyles) ? variante : 'proximamente';
  const badge = badgeStyles[validVariante];
  if (!badge) return null;

  const isRanked = (competencia as any).rankedEnabled || (competencia as any).esRanked || (competencia as any).isRanked || (competencia as any).tipo === 'ranked';

  const fechaInicio = competencia.fechaInicio ? formatDate(competencia.fechaInicio) : null;
  const fechaFin = competencia.fechaFin ? formatDate(competencia.fechaFin) : null;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white shadow-sm transition overflow-hidden ${
        validVariante === 'en_curso' ? 'border-emerald-200' : 'border-slate-200'
      } ${onClick ? 'cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* Status stripe */}
      <div className={`h-1 w-full ${validVariante === 'en_curso' ? 'bg-emerald-400' : validVariante === 'proximamente' ? 'bg-sky-400' : 'bg-slate-200'}`} />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug truncate">{competencia.nombre}</h3>
            {competencia.organizacion && (
              <p className="mt-0.5 text-xs font-medium text-brand-600 truncate">
                {competencia.organizacion.nombre || 'Sin organización'}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[validVariante]}`} />
              {badge.label}
            </span>
            {isRanked && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 border border-indigo-100">
                Ranked
              </span>
            )}
          </div>
        </div>

        {competencia.descripcion && (
          <p className="text-xs text-slate-500 line-clamp-2">{competencia.descripcion}</p>
        )}

        {/* Dates + teams */}
        {(fechaInicio || fechaFin || competencia.equipos) && (
          <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-slate-100 text-xs text-slate-500">
            {fechaInicio && (
              <span>
                <span className="font-semibold text-slate-700">Inicio:</span> {fechaInicio}
              </span>
            )}
            {fechaFin && (
              <span>
                <span className="font-semibold text-slate-700">Fin:</span> {fechaFin}
              </span>
            )}
            {competencia.equipos && (
              <span>
                <span className="font-semibold text-slate-700">Equipos:</span> {competencia.equipos}
              </span>
            )}
          </div>
        )}
      </div>

      {actions && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </article>
  );
};

export default CompetenciaCard;

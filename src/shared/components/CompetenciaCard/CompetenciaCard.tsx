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
  proximamente: {
    label: 'Próxima',
    className: 'bg-sky-100 text-sky-700',
  },
  en_curso: {
    label: 'En curso',
    className: 'bg-emerald-100 text-emerald-700',
  },
  finalizada: {
    label: 'Finalizada',
    className: 'bg-slate-100 text-slate-700',
  },
} as const;

const CompetenciaCard = ({ competencia, variante = 'proximamente', actions, onClick }: CompetenciaCardProps) => {
  // Defensa contra datos corruptos
  if (!competencia) return null;

  // Asegurar que siempre tengamos un estilo de badge válido
  const badge = badgeStyles[variante] || badgeStyles.proximamente;

  // Si por alguna razón badge sigue siendo undefined (imposible teóricamente), fallback de emergencia
  if (!badge) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const fechaInicioTexto = competencia.fechaInicio ? formatDate(competencia.fechaInicio) : null;
  const fechaFinTexto = competencia.fechaFin ? formatDate(competencia.fechaFin) : null;

  return (
    <article
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition ${
        onClick ? 'cursor-pointer hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Competencia
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            {competencia.nombre}
          </h3>
          {competencia.descripcion && (
            <p className="text-sm text-slate-500">{competencia.descripcion}</p>
          )}
          {competencia.organizacion && (
            <p className="mt-1 text-sm font-medium text-brand-600">
              Org: {competencia.organizacion.nombre || 'Desconocida'}
            </p>
          )}
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      {(fechaInicioTexto || fechaFinTexto || competencia.equipos) && (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
          {competencia.equipos && (
            <div className="mb-2">
              <p className="font-semibold text-slate-700">Equipos participantes</p>
              <p className="text-slate-900">{competencia.equipos}</p>
            </div>
          )}
          {fechaInicioTexto && (
            <div className="mb-2">
              <p className="font-semibold text-slate-700">Fecha inicio</p>
              <p className="text-slate-900">{fechaInicioTexto}</p>
            </div>
          )}
          {fechaFinTexto && (
            <div>
              <p className="font-semibold text-slate-700">Fecha fin</p>
              <p className="text-slate-900">{fechaFinTexto}</p>
            </div>
          )}
        </div>
      )}

      {actions ? <div className="mt-auto flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
};

export default CompetenciaCard;

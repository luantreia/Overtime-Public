import type { KeyboardEvent, ReactNode } from 'react';
import type { Organizacion } from '../../../features/competencias/services/organizacionService';

export interface OrganizacionCardProps {
  organizacion: Organizacion;
  actions?: ReactNode;
  onClick?: () => void;
}

const OrganizacionCard = ({ organizacion, actions, onClick }: OrganizacionCardProps) => {
  // Defensa contra datos corruptos
  if (!organizacion) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

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
            Organización
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            {organizacion.nombre}
          </h3>
          {organizacion.descripcion && (
            <p className="text-sm text-slate-500">{organizacion.descripcion}</p>
          )}
        </div>
        {organizacion.logoUrl && (
          <img
            src={organizacion.logoUrl}
            alt={`Logo de ${organizacion.nombre}`}
            className="h-12 w-12 rounded-full object-cover"
          />
        )}
      </header>

      {actions ? <div className="mt-auto flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
};

export default OrganizacionCard;
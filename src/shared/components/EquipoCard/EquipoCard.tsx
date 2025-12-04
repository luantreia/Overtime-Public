import type { KeyboardEvent, ReactNode } from 'react';
import type { Equipo } from '../../../features/equipos/services/equipoService';

export interface EquipoCardProps {
  equipo: Equipo;
  actions?: ReactNode;
  onClick?: () => void;
}

const EquipoCard = ({ equipo, actions, onClick }: EquipoCardProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const initials = equipo.nombre
    ? equipo.nombre
        .split(' ')
        .map((chunk) => chunk[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const imageSrc = equipo.escudo || equipo.imagen;

  return (
    <article
      className={`relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card transition ${
        onClick ? 'cursor-pointer hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`Escudo de ${equipo.nombre}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-300 text-white">
          <span className="text-4xl font-semibold tracking-wide">{initials}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/10" />

      {actions && (
        <div className="absolute top-4 right-4 flex gap-2">
          {actions}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{equipo.nombre}</h3>
            {equipo.ciudad && (
              <p className="text-sm opacity-90">{equipo.ciudad}</p>
            )}
            {equipo.organizacion?.nombre && (
              <p className="text-xs uppercase tracking-wide opacity-75">{equipo.organizacion.nombre}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default EquipoCard;

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
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-600">
            {equipo.imagen ? (
              <img
                src={equipo.imagen}
                alt={equipo.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl">{equipo.nombre.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{equipo.nombre}</h3>
            {equipo.descripcion && (
              <p className="text-sm text-slate-500">{equipo.descripcion}</p>
            )}
          </div>
        </div>
      </header>

      {equipo.organizacion && (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <p className="font-semibold text-slate-700">Organización</p>
          <p className="text-slate-900">{equipo.organizacion.nombre}</p>
        </div>
      )}

      {equipo.ciudad && (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <p className="font-semibold text-slate-700">Ciudad</p>
          <p className="text-slate-900">{equipo.ciudad}</p>
        </div>
      )}

      {actions ? <div className="mt-auto flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
};

export default EquipoCard;

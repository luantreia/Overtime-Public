import type { KeyboardEvent, ReactNode } from 'react';
import type { Jugador } from '../../../features/jugadores/services/jugadorService';

export interface JugadorCardProps {
  jugador: Jugador;
  variante?: 'activo' | 'inactivo';
  actions?: ReactNode;
  onClick?: () => void;
}

const badgeStyles = {
  activo: {
    label: 'Activo',
    className: 'bg-emerald-100 text-emerald-700',
  },
  inactivo: {
    label: 'Inactivo',
    className: 'bg-slate-100 text-slate-700',
  },
} as const;

const JugadorCard = ({ jugador, variante = 'activo', actions, onClick }: JugadorCardProps) => {
  const badge = badgeStyles[variante];

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
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
          {jugador.imagen ? (
            <img
              src={jugador.imagen}
              alt={jugador.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {jugador.posicion || 'Sin posición'}
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            {jugador.nombre}
          </h3>
          {jugador.numero && (
            <p className="text-sm text-slate-500">Camiseta #{jugador.numero}</p>
          )}
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {jugador.equipo && (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <p className="font-semibold text-slate-700">Equipo</p>
          <p className="text-slate-900">{jugador.equipo.nombre}</p>
        </div>
      )}

      {actions ? <div className="mt-auto flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
};

export default JugadorCard;
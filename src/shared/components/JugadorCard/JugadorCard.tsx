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
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {jugador.posicion || 'Sin posición'}
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            {jugador.nombre}
          </h3>
          {jugador.numero && (
            <p className="text-sm text-slate-500">Camiseta #{jugador.numero}</p>
          )}
          {jugador.posicion && (
            <p className="text-xs text-slate-400">{jugador.posicion}</p>
          )}
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </header>

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
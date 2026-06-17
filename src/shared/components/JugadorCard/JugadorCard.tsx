import type { KeyboardEvent, ReactNode } from 'react';
import type { Jugador } from '../../../features/jugadores/services/jugadorService';
import { formatDate } from '../../../utils/formatDate';

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
  if (!jugador) return null;

  const badge = badgeStyles[variante];
  const fotoUrl = jugador.foto;
  const edad = jugador.edad ? `${jugador.edad} años` : null;
  const fechaNacimiento = jugador.fechaNacimiento ? formatDate(jugador.fechaNacimiento) : null;

  const initials = jugador.nombre
    .split(' ')
    .map((t) => t[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colorIndex = jugador.nombre.charCodeAt(0) % 6;
  const gradients = [
    'from-brand-700 to-brand-900',
    'from-indigo-600 to-indigo-900',
    'from-emerald-600 to-emerald-900',
    'from-amber-600 to-amber-900',
    'from-rose-600 to-rose-900',
    'from-sky-600 to-sky-900',
  ];

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={`relative aspect-[1/2] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card transition ${
        onClick ? 'cursor-pointer hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* Foto de fondo */}
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={jugador.nombre}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br ${gradients[colorIndex]}`}>
          <span className="text-5xl font-black text-white/80 select-none">{initials}</span>
        </div>
      )}

      {/* Footer semitransparente */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{jugador.nombre}</h3>
            <div className="flex flex-col gap-0.5 opacity-90 text-sm">
              {jugador.alias && <p>Alias: {jugador.alias}</p>}
              {edad && <p>{edad}</p>}
              {fechaNacimiento && <p className="text-xs opacity-75">Nac.: {fechaNacimiento}</p>}
            </div>
            <p className="text-xs uppercase tracking-wide opacity-75 mt-1">
              {jugador.genero ? jugador.genero.charAt(0).toUpperCase() + jugador.genero.slice(1) : 'Sin género'}
            </p>
          </div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Acciones opcionales (si se necesitan, pero ocultas por ahora) */}
      {actions && (
        <div className="absolute top-4 right-4 flex gap-2">
          {actions}
        </div>
      )}
    </article>
  );
};

export default JugadorCard;
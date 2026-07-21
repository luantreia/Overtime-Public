import type { KeyboardEvent } from 'react';
import type { Jugador } from '../../../features/jugadores/services/jugadorService';

export interface JugadorCardProps {
  jugador: Jugador;
  onClick?: () => void;
}

const JugadorCard = ({ jugador, onClick }: JugadorCardProps) => {
  if (!jugador) return null;

  const fotoUrl = jugador.foto;

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

      {/* Footer semitransparente: solo nombre */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white">
        <h3 className="text-lg font-semibold truncate">{jugador.nombre}</h3>
      </div>
    </article>
  );
};

export default JugadorCard;
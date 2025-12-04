import type { KeyboardEvent, ReactNode } from 'react';
import type { Partido } from '../../../types';
import { formatDate, formatDateTime } from '../../../utils/formatDate';

export interface PartidoCardProps {
  partido: Partido;
  variante?: 'proximo' | 'resultado';
  actions?: ReactNode;
  onClick?: () => void;
}

const badgeStyles = {
  programado: {
    label: 'Programado',
    className: 'bg-sky-100 text-sky-700',
  },
  en_juego: {
    label: 'En Juego',
    className: 'bg-amber-100 text-amber-700 animate-pulse',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-emerald-100 text-emerald-600',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-600',
  },
  proximamente: {
    label: 'Próximamente',
    className: 'bg-slate-100 text-slate-600',
  }
} as const;

const PartidoCard = ({ partido, variante = 'proximo', actions, onClick }: PartidoCardProps) => {
  const fechaTexto = partido.fecha && partido.hora
    ? formatDateTime(`${partido.fecha}T${partido.hora}`)
    : partido.fecha
    ? formatDate(partido.fecha)
    : 'Fecha no disponible';

  // Mapear estado del partido a estilo de badge
  const estado = partido.estado || 'programado';
  const badge = badgeStyles[estado as keyof typeof badgeStyles] || badgeStyles.programado;

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
            {partido.competencia?.nombre ?? 'Partido amistoso'}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {/* Equipo Local */}
            <div className="flex items-center gap-2">
              {partido.equipoLocal?.escudo ? (
                <img 
                  src={partido.equipoLocal.escudo} 
                  alt={partido.equipoLocal.nombre} 
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {partido.equipoLocal?.nombre?.charAt(0) || 'L'}
                </div>
              )}
              <span className="font-semibold text-slate-900">{partido.equipoLocal?.nombre || 'Equipo Local'}</span>
            </div>

            {/* Equipo Visitante */}
            <div className="flex items-center gap-2">
              {partido.equipoVisitante?.escudo ? (
                <img 
                  src={partido.equipoVisitante.escudo} 
                  alt={partido.equipoVisitante.nombre} 
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {partido.equipoVisitante?.nombre?.charAt(0) || 'V'}
                </div>
              )}
              <span className="font-semibold text-slate-900">{partido.equipoVisitante?.nombre || partido.rival || 'Equipo Visitante'}</span>
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span>{fechaTexto}</span>
            {partido.escenario && (
              <>
                <span>•</span>
                <span>{partido.escenario}</span>
              </>
            )}
          </div>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      {/* Mostrar resultado si el partido está finalizado o en juego */}
      {(estado === 'finalizado' || estado === 'en_juego') && (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Marcador</span>
            <div className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <span>{partido.marcadorLocal ?? 0}</span>
              <span className="text-slate-400">-</span>
              <span>{partido.marcadorVisitante ?? 0}</span>
            </div>
          </div>
        </div>
      )}

      {actions ? <div className="mt-auto flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
};

export default PartidoCard;

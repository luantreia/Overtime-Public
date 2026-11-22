import React from 'react';
import { Link } from 'react-router-dom';
import type { LeaderboardItem } from '../../competencias/services/rankedService';

interface PodioRankingProps {
  items: LeaderboardItem[];
  loading: boolean;
}

const MEDALLA = [
  { borde: 'border-amber-300', fondo: 'bg-amber-50', insignia: 'bg-amber-400', etiqueta: '1.º' },
  { borde: 'border-slate-300', fondo: 'bg-slate-50', insignia: 'bg-slate-400', etiqueta: '2.º' },
  { borde: 'border-orange-300', fondo: 'bg-orange-50', insignia: 'bg-amber-600', etiqueta: '3.º' },
];

const iniciales = (nombre: string) =>
  nombre.split(/s+/).filter(Boolean).map((t) => t[0]).join('').slice(0, 2).toUpperCase();

function Delta({ valor }: { valor?: number }) {
  if (valor === undefined || valor === null) return null;
  const color = valor > 0 ? 'bg-green-100 text-green-800' : valor < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-bold tabular-nums ${color}`} title="Variación en su último partido rankeado">
      {valor > 0 ? '+' : ''}{Number(valor).toFixed(1)}
    </span>
  );
}

/** Top 3 del ranking. En mobile se apilan; desde sm van en fila con el 1.º al centro. */
export function PodioRanking({ items, loading }: PodioRankingProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
    );
  }

  const top = items.slice(0, 3);
  if (top.length === 0) return null;
  // En desktop: 2.º | 1.º | 3.º. En mobile el orden del DOM (1, 2, 3) es el que se lee.
  const ordenDesktop = ['sm:order-2', 'sm:order-1', 'sm:order-3'];

  return (
    <section aria-label="Podio">
      <ol className="grid gap-3 sm:grid-cols-3 sm:items-end">
        {top.map((item, i) => {
          const m = MEDALLA[i];
          const nombre = item.playerName || 'Jugador';
          const pj = item.matchesPlayed;
          const winrate = pj > 0 ? Math.round(((item.wins ?? 0) / pj) * 100) : 0;
          return (
            <li key={item.playerId} className={ordenDesktop[i]}>
              <Link
                to={`/jugadores/${item.playerId}`}
                className={`flex items-center gap-3 rounded-xl border-2 ${m.borde} ${m.fondo} p-4 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:flex-col sm:text-center ${i === 0 ? 'sm:py-6' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`flex items-center justify-center rounded-full bg-white font-bold text-slate-700 border border-slate-200 ${i === 0 ? 'h-16 w-16 text-lg' : 'h-12 w-12 text-sm'}`}>
                    {iniciales(nombre)}
                  </div>
                  <span className={`absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-2xs font-black text-white ${m.insignia}`}>
                    <span className="sr-only">Puesto </span>{i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1 sm:flex-none">
                  <p className="truncate font-bold text-slate-900">{nombre}</p>
                  <p className="text-xs text-slate-500 tabular-nums">{pj} PJ · {winrate}% victorias</p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-xl font-black text-slate-900 tabular-nums">{Math.round(item.rating)}</span>
                  <Delta valor={item.lastDelta} />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

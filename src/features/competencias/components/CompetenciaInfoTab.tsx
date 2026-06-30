import React from 'react';
import { type Competencia } from '../services/competenciaService';
import { type JugadorCompetencia } from '../services/jugadorCompetenciaService';
import { type LeaderboardItem } from '../services/rankedService';

interface TemporadaConGanador {
  _id: string;
  nombre: string;
  estado?: string;
  ganador?: { _id: string; nombre: string; escudo?: string } | null;
  participaciones?: { equipo: { _id: string; nombre: string; escudo?: string } | string; estado?: string }[];
}

interface CompetenciaInfoTabProps {
  competencia: Competencia;
  isRanked: boolean;
  jugadoresComp: JugadorCompetencia[];
  top3Leaderboard: LeaderboardItem[];
  loadingTop3: boolean;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(t => t[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };
const MEDAL_BG: Record<number, string> = {
  0: 'bg-amber-400',
  1: 'bg-slate-400',
  2: 'bg-amber-600',
};

export const CompetenciaInfoTab: React.FC<CompetenciaInfoTabProps> = ({
  competencia,
  isRanked,
  jugadoresComp,
  top3Leaderboard,
  loadingTop3,
}) => {
  const embeddedTemporadas: TemporadaConGanador[] = (competencia as any).temporadas ?? [];

  // Teams: unique across all seasons, from participaciones
  const teamsMap = new Map<string, { _id: string; nombre: string; escudo?: string }>();
  for (const t of embeddedTemporadas) {
    for (const p of t.participaciones ?? []) {
      const equipo = p.equipo as any;
      if (equipo && typeof equipo === 'object' && equipo._id) {
        if (!teamsMap.has(equipo._id)) {
          teamsMap.set(equipo._id, { _id: equipo._id, nombre: equipo.nombre, escudo: equipo.escudo });
        }
      }
    }
  }
  const teams = Array.from(teamsMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Champions: group by team, sorted by title count descending
  const championsByTeam = (() => {
    const map = new Map<string, { equipo: { _id: string; nombre: string; escudo?: string }; titulos: string[] }>();
    for (const t of [...embeddedTemporadas].reverse()) {
      if (!t.ganador) continue;
      const g = t.ganador;
      if (!map.has(g._id)) map.set(g._id, { equipo: g, titulos: [] });
      map.get(g._id)!.titulos.push(t.nombre);
    }
    return Array.from(map.values()).sort((a, b) => b.titulos.length - a.titulos.length);
  })();

  // Player photo lookup for ranked top3
  const getPlayerFoto = (playerId: string): string => {
    const jc = jugadoresComp.find(j => {
      const jug = j.jugador as any;
      const jid = typeof jug === 'string' ? jug : jug?._id;
      return jid === playerId;
    });
    const jug = jc?.jugador as any;
    return (typeof jug === 'object' ? jug?.foto : undefined) ?? (jc as any)?.foto ?? '';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Base details */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Detalles</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-slate-500">Inicio</dt>
            <dd className="mt-0.5 text-sm text-slate-900">
              {competencia.fechaInicio ? new Date(competencia.fechaInicio).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Fin</dt>
            <dd className="mt-0.5 text-sm text-slate-900">
              {competencia.fechaFin ? new Date(competencia.fechaFin).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Organización</dt>
            <dd className="mt-0.5 text-sm text-slate-900">{(competencia as any).organizacion?.nombre || '—'}</dd>
          </div>
        </dl>
      </div>

      {isRanked ? (
        <>
          {/* Ranked: player count */}
          <div className="flex items-center gap-3 rounded-lg bg-brand-50 border border-brand-100 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-brand-600">
                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-700">{jugadoresComp.length}</div>
              <div className="text-xs text-brand-500 font-medium">jugadores registrados</div>
            </div>
          </div>

          {/* Ranked: top 3 vitrina */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Top 3 — Nivel Competencia</h3>
            {loadingTop3 ? (
              <div className="flex gap-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex-1 h-24 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : top3Leaderboard.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No hay datos de ranking disponibles aún.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {top3Leaderboard.slice(0, 3).map((item, idx) => {
                  const playerId = typeof item.playerId === 'string' ? item.playerId : (item.playerId as any)?._id ?? '';
                  const playerName = item.playerName || 'Jugador';
                  const foto = getPlayerFoto(playerId);
                  const winrate = item.matchesPlayed > 0 ? ((item.wins ?? 0) / item.matchesPlayed * 100).toFixed(0) : '0';
                  return (
                    <div
                      key={playerId}
                      className={`relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center ${
                        idx === 0
                          ? 'border-amber-200 bg-amber-50 shadow-sm'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xl">{MEDAL[idx]}</span>
                      <div className="relative mt-1">
                        {foto ? (
                          <img src={foto} alt={playerName} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow" />
                        ) : (
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white ${MEDAL_BG[idx]}`}>
                            {getInitials(playerName)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{playerName}</div>
                      <div className="text-lg font-black text-brand-700 leading-none">{Number(item.rating).toFixed(0)}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{winrate}% WR · {item.matchesPlayed}P</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Not ranked: participating teams */}
          {teams.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Equipos participantes <span className="normal-case font-normal text-slate-400">({teams.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {teams.map(team => (
                  <div key={team._id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    {team.escudo ? (
                      <img src={team.escudo} alt={team.nombre} className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-700 flex-shrink-0">
                        {getInitials(team.nombre)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-800 truncate">{team.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not ranked: champions vitrina grouped by team */}
          {championsByTeam.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Palmarés</h3>
              <div className="flex flex-col gap-2">
                {championsByTeam.map(({ equipo, titulos }, idx) => (
                  <div
                    key={equipo._id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      idx === 0
                        ? 'border-amber-200 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Rank badge */}
                    <span className="text-xl flex-shrink-0 w-7 text-center">
                      {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                    </span>

                    {/* Escudo */}
                    {equipo.escudo ? (
                      <img src={equipo.escudo} alt={equipo.nombre} className="h-9 w-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                        {getInitials(equipo.nombre)}
                      </div>
                    )}

                    {/* Name + seasons */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">{equipo.nombre}</div>
                      <div className="text-xs text-slate-500 truncate">{titulos.join(' · ')}</div>
                    </div>

                    {/* Title count */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <span className="text-lg font-black text-amber-500">{titulos.length}</span>
                      <span className="text-xs text-slate-400 font-medium">{titulos.length === 1 ? 'título' : 'títulos'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

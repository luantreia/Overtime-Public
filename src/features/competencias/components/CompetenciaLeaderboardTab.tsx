import React, { useState, useMemo } from 'react';
import { type Temporada } from '../services/temporadaService';
import { type LeaderboardItem } from '../services/rankedService';
import { type JugadorCompetencia } from '../services/jugadorCompetenciaService';
import { EloExplanationModal } from '../../../shared/components/EloExplanationModal';

interface CompetenciaLeaderboardTabProps {
  temporadas: Temporada[];
  selectedTemporada: string;
  onTemporadaChange: (id: string) => void;
  loading: boolean;
  leaderboard: LeaderboardItem[];
  jugadoresComp: JugadorCompetencia[];
  onPlayerClick: (player: { id: string; name: string }) => void;
}

export const CompetenciaLeaderboardTab: React.FC<CompetenciaLeaderboardTabProps> = ({
  temporadas,
  selectedTemporada,
  onTemporadaChange,
  loading,
  leaderboard,
  jugadoresComp,
  onPlayerClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeaderboard = useMemo(() => {
    if (!searchTerm.trim()) return leaderboard;
    const term = searchTerm.toLowerCase();
    return leaderboard.filter(item => 
      (item.playerName || '').toLowerCase().includes(term) ||
      (typeof item.playerId === 'string' ? item.playerId.toLowerCase().includes(term) : false)
    );
  }, [leaderboard, searchTerm]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
          <div className="w-full sm:w-1/2">
            <label htmlFor="temporada-leaderboard" className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
            <select
              id="temporada-leaderboard"
              value={selectedTemporada || "global"}
              onChange={(e) => onTemporadaChange(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            >
              <option value="global">Histórico Global</option>
              {temporadas.map((t) => (
                <option key={t._id} value={t._id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-1/2">
            <label htmlFor="search-leaderboard" className="block text-sm font-medium text-slate-700 mb-1">Buscar Jugador</label>
            <div className="relative">
              <input
                id="search-leaderboard"
                type="text"
                placeholder="Nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 pl-9 border"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mb-1 flex-shrink-0">
          <EloExplanationModal 
            trigger={
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                ¿Cómo funciona el ranking?
              </button>
            }
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando ranking...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          No hay datos de ranking disponibles para esta selección.
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jugador</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating (ELO)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Winrate %</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Partidos</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tendencia</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLeaderboard.map((item) => {
                  const originalIndex = leaderboard.findIndex(l => l.playerId === item.playerId);
                  const playerId = typeof item.playerId === 'object' ? (item.playerId as any)._id : item.playerId;
                  const jugadorCompInfo = jugadoresComp.find(jc => {
                    const jcPlayerId = typeof jc.jugador === 'object' ? jc.jugador._id : jc.jugador;
                    return jcPlayerId === playerId;
                  });

                  const playerFoto = (typeof item.playerId === 'object' ? (item.playerId as any).foto : (item as any).foto) 
                                   || (typeof jugadorCompInfo?.jugador === 'object' ? jugadorCompInfo.jugador.foto : undefined)
                                   || jugadorCompInfo?.foto;
                  
                  const initials = (item.playerName || 'PJ')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  const winrate = item.matchesPlayed > 0 ? (item.wins || 0) / item.matchesPlayed * 100 : 0;
                    
                  return (
                    <tr 
                      key={playerId} 
                      className="hover:bg-brand-50/30 cursor-pointer transition-colors"
                      onClick={() => onPlayerClick({ id: playerId, name: item.playerName || playerId })}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{originalIndex + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <img 
                              src={playerFoto || ''}
                              alt={item.playerName || 'Jugador'}
                              className="absolute inset-0 w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200 shadow-md z-10"
                              onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                            />
                            <div className="absolute inset-0 w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold border border-brand-200">
                              {initials}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-slate-900">{item.playerName || playerId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{Number(item.rating).toFixed(3)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-black ${winrate >= 50 ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {winrate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.matchesPlayed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.lastDelta !== undefined ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.lastDelta > 0 ? 'bg-green-100 text-green-800' : item.lastDelta < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {item.lastDelta > 0 ? '+' : ''}{Number(item.lastDelta).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredLeaderboard.map((item) => {
              const originalIndex = leaderboard.findIndex(l => l.playerId === item.playerId);
              const playerId = typeof item.playerId === 'object' ? (item.playerId as any)._id : item.playerId;
              const jugadorCompInfo = jugadoresComp.find(jc => {
                const jcPlayerId = typeof jc.jugador === 'object' ? jc.jugador._id : jc.jugador;
                return jcPlayerId === playerId;
              });

              const playerFoto = (typeof item.playerId === 'object' ? (item.playerId as any).foto : (item as any).foto) 
                               || (typeof jugadorCompInfo?.jugador === 'object' ? jugadorCompInfo.jugador.foto : undefined)
                               || jugadorCompInfo?.foto;
              
              const initials = (item.playerName || 'PJ')
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const winrate = item.matchesPlayed > 0 ? (item.wins || 0) / item.matchesPlayed * 100 : 0;
                
              return (
                <div 
                  key={playerId} 
                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm active:bg-slate-50 cursor-pointer"
                  onClick={() => onPlayerClick({ id: playerId, name: item.playerName || playerId })}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img 
                        src={playerFoto || ''}
                        alt={item.playerName || 'Jugador'}
                        className="absolute inset-0 w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200 shadow-md z-10"
                        onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                      />
                      <div className="absolute inset-0 w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold border border-brand-200">
                        {initials}
                      </div>
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20 border border-white shadow-sm">
                        {originalIndex + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {item.playerName || playerId}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.matchesPlayed} {item.matchesPlayed === 1 ? 'partido' : 'partidos'} • <span className="font-bold text-emerald-600">{winrate.toFixed(0)}% W</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-slate-900 leading-none">
                        {Number(item.rating).toFixed(3)}
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium mb-1 uppercase tracking-wider">ELO</div>
                      {item.lastDelta !== undefined ? (
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.lastDelta > 0 ? 'bg-green-100 text-green-700' : item.lastDelta < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.lastDelta > 0 ? '+' : ''}{Number(item.lastDelta).toFixed(1)}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400">---</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredLeaderboard.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No se encontraron jugadores que coincidan con tu búsqueda.
            </div>
          )}
        </>
      )}
    </div>
  );
};

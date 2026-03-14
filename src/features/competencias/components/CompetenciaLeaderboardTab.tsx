import React, { useState, useMemo } from 'react';
import { type Temporada } from '../services/temporadaService';
import { type LeaderboardItem } from '../services/rankedService';
import { type JugadorCompetencia } from '../services/jugadorCompetenciaService';
import { EloExplanationModal } from '../../../shared/components/EloExplanationModal';
import { RankedEvolutionChartModal } from './RankedEvolutionChartModal';

interface CompetenciaLeaderboardTabProps {
  temporadas: Temporada[];
  selectedTemporada: string;
  onTemporadaChange: (id: string) => void;
  loading: boolean;
  leaderboard: LeaderboardItem[];
  jugadoresComp: JugadorCompetencia[];
  onPlayerClick: (player: { id: string; name: string }) => void;
  competenciaId: string;
}

export const CompetenciaLeaderboardTab: React.FC<CompetenciaLeaderboardTabProps> = ({
  temporadas,
  selectedTemporada,
  onTemporadaChange,
  loading,
  leaderboard,
  jugadoresComp,
  onPlayerClick,
  competenciaId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [comparingPlayers, setComparingPlayers] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setComparingPlayers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

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
        <div className="mb-1 flex-shrink-0 flex items-center gap-3">
          <button 
            onClick={() => setIsChartModalOpen(true)}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0v1.125c0 1.125.507 2.097 1.307 2.668L12 10.312l5.693-3.519A3.001 3.001 0 0 1 19.5 4.5V3m-15.75 0h15.75m-15.75 0a2.25 2.25 0 0 1 2.25-2.25h11.25a2.25 2.25 0 0 1 2.25 2.25m-15.75 0v1.125" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V15a2.25 2.25 0 0 0-2.25-2.25H4.5A2.25 2.25 0 0 0 2.25 15v3z" />
            </svg>
            Ver Evolución
          </button>
          
          <div className="w-px h-4 bg-slate-300"></div>

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

      {/* Compare Floating Action Bar */}
      {comparingPlayers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-2xl border border-brand-200 rounded-full px-6 py-3 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex -space-x-3">
            {comparingPlayers.map(pid => {
              const p = leaderboard.find(l => (typeof l.playerId === 'object' ? (l.playerId as any)._id : l.playerId) === pid);
              return (
                <div key={pid} className="w-10 h-10 rounded-full border-2 border-white bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shadow-sm overflow-hidden">
                  {p?.playerName?.slice(0, 2).toUpperCase() || '??'}
                </div>
              );
            })}
            {comparingPlayers.length < 2 && (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                <span className="text-xl">+</span>
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-slate-200"></div>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={comparingPlayers.length < 2}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                comparingPlayers.length === 2 
                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md transform hover:-translate-y-0.5' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Comparar VS
            </button>
            <button 
              onClick={() => setComparingPlayers([])}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
                  const playerId = typeof item.playerId === 'object' ? (item.playerId as any)?._id : item.playerId;
                  const jugadorCompInfo = jugadoresComp.find(jc => {
                    const jcPlayerId = typeof jc.jugador === 'object' ? (jc.jugador as any)?._id : jc.jugador;
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
                  
                  // ELO-based Badge logic
                  const getRankBadge = (elo: number) => {
                    if (elo >= 1500) return { label: 'Diamante', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
                    if (elo >= 1200) return { label: 'Oro', color: 'bg-amber-100 text-amber-700 border-amber-200' };
                    if (elo >= 1000) return { label: 'Plata', color: 'bg-slate-200 text-slate-700 border-slate-300' };
                    return { label: 'Bronce', color: 'bg-orange-100 text-orange-700 border-orange-200' };
                  };
                  const badge = getRankBadge(Number(item.rating));
                    
                  return (
                    <tr 
                      key={playerId} 
                      className={`transition-all duration-200 cursor-pointer ${
                        comparingPlayers.includes(playerId) 
                          ? 'bg-brand-50 border-l-4 border-brand-500 shadow-inner' 
                          : 'hover:bg-brand-50/50 hover:scale-[1.01] hover:shadow-sm'
                      }`}
                      onClick={() => onPlayerClick({ id: playerId, name: item.playerName || playerId })}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(playerId);
                            }}
                            className={`p-1.5 rounded-full border transition-all ${
                              comparingPlayers.includes(playerId)
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'bg-white border-slate-200 text-slate-400 hover:border-brand-500 hover:text-brand-500'
                            }`}
                            title="Comparar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M5.127 4.49a.75.75 0 011.017.346L9 10.428l2.856-5.592a.75.75 0 111.332.678L10 11.635V16a.75.75 0 01-1.5 0v-4.365L5.474 5.507a.75.75 0 01.347-1.016z" />
                            </svg>
                          </button>
                          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                            {originalIndex < 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                originalIndex === 0 ? 'bg-amber-400 text-white' : 
                                originalIndex === 1 ? 'bg-slate-300 text-white' : 
                                'bg-amber-600 text-white'
                              }`}>
                                {originalIndex + 1}
                              </span>
                            ) : originalIndex + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <img 
                              src={playerFoto || ''}
                              alt={item.playerName || 'Jugador'}
                              className="absolute inset-0 w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200 shadow-sm z-10 transition-transform group-hover:scale-110"
                              onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                            />
                            <div className="absolute inset-0 w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold border border-brand-200">
                              {initials}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{item.playerName || playerId}</div>
                            <span className={`mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-brand-600">{Number(item.rating).toFixed(1)}</td>
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
              const playerId = typeof item.playerId === 'object' ? (item.playerId as any)?._id : item.playerId;
              const jugadorCompInfo = jugadoresComp.find(jc => {
                const jcPlayerId = typeof jc.jugador === 'object' ? (jc.jugador as any)?._id : jc.jugador;
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
              
              const getRankBadge = (elo: number) => {
                if (elo >= 1500) return { label: 'Diamante', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
                if (elo >= 1200) return { label: 'Oro', color: 'bg-amber-100 text-amber-700 border-amber-200' };
                if (elo >= 1000) return { label: 'Plata', color: 'bg-slate-200 text-slate-700 border-slate-300' };
                return { label: 'Bronce', color: 'bg-orange-100 text-orange-700 border-orange-200' };
              };
              const badge = getRankBadge(Number(item.rating));
                
              return (
                <div 
                  key={playerId} 
                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-brand-300"
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
                      <div className={`absolute -top-1 -left-1 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20 border border-white shadow-sm ${
                        originalIndex === 0 ? 'bg-amber-400' : 
                        originalIndex === 1 ? 'bg-slate-400' : 
                        originalIndex === 2 ? 'bg-amber-600' : 'bg-slate-800'
                      }`}>
                        {originalIndex + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {item.playerName || playerId}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1 rounded-[4px] text-[9px] font-black uppercase border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {winrate.toFixed(0)}% Winrate
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-brand-600 leading-none">
                        {Number(item.rating).toFixed(1)}
                      </div>
                      <div className="text-[8px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">RATING</div>
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

import React, { useMemo, useState } from 'react';
import { type Temporada } from '../services/temporadaService';
import { type LeaderboardItem } from '../services/rankedService';
import { type JugadorCompetencia } from '../services/jugadorCompetenciaService';
import { EloExplanationModal } from '../../../shared/components/EloExplanationModal';
import { RankedEvolutionChartModal } from './RankedEvolutionChartModal';
import { CompareVSModal } from './CompareVSModal';
import { ShareRankModal } from './ShareRankModal';

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

const getPlayerId = (item: LeaderboardItem): string => {
  if (typeof item.playerId === 'string') return item.playerId;
  const candidate = item.playerId as unknown as { _id?: string };
  return candidate?._id || '';
};

const getPlayerName = (item: LeaderboardItem, fallbackId: string): string => item.playerName || fallbackId || 'Jugador';

const getPlayerFoto = (item: LeaderboardItem, jugadoresComp: JugadorCompetencia[]): string => {
  const playerId = getPlayerId(item);
  const fromItem = (item as unknown as { foto?: string }).foto;
  if (fromItem) return fromItem;

  const jugadorCompInfo = jugadoresComp.find((jc) => {
    const jcJugador = jc.jugador as unknown as string | { _id?: string; foto?: string };
    const jcPlayerId = typeof jcJugador === 'string' ? jcJugador : jcJugador?._id;
    return jcPlayerId === playerId;
  });

  const jcJugador = jugadorCompInfo?.jugador as unknown as string | { foto?: string };
  const fromJugadorObject = typeof jcJugador === 'object' ? jcJugador?.foto : undefined;
  const fromJugadorComp = (jugadorCompInfo as unknown as { foto?: string } | undefined)?.foto;

  return fromJugadorObject || fromJugadorComp || '';
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((token) => token[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const CompetenciaLeaderboardTab: React.FC<CompetenciaLeaderboardTabProps> = ({
  temporadas,
  selectedTemporada,
  onTemporadaChange,
  loading,
  leaderboard,
  jugadoresComp,
  onPlayerClick,
  competenciaId: _competenciaId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [comparingPlayers, setComparingPlayers] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [shareConfig, setShareConfig] = useState<{ isOpen: boolean; player: LeaderboardItem | null; rank: number }>({
    isOpen: false,
    player: null,
    rank: 0,
  });

  const filteredLeaderboard = useMemo(() => {
    if (!searchTerm.trim()) return leaderboard;
    const term = searchTerm.toLowerCase();
    return leaderboard.filter((item) => {
      const playerId = getPlayerId(item).toLowerCase();
      const playerName = (item.playerName || '').toLowerCase();
      return playerId.includes(term) || playerName.includes(term);
    });
  }, [leaderboard, searchTerm]);

  const selectedPlayers = useMemo(
    () =>
      comparingPlayers
        .map((id) => leaderboard.find((item) => getPlayerId(item) === id))
        .filter(Boolean) as LeaderboardItem[],
    [comparingPlayers, leaderboard],
  );

  const toggleCompare = (id: string) => {
    setComparingPlayers((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[1], id];
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
          <div className="w-full sm:w-1/2">
            <label htmlFor="temporada-leaderboard" className="block text-sm font-medium text-slate-700 mb-1">
              Temporada
            </label>
            <select
              id="temporada-leaderboard"
              value={selectedTemporada || 'global'}
              onChange={(e) => onTemporadaChange(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            >
              <option value="global">Histórico Global</option>
              {temporadas.map((temporada) => (
                <option key={temporada._id} value={temporada._id}>
                  {temporada.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/2">
            <label htmlFor="search-leaderboard" className="block text-sm font-medium text-slate-700 mb-1">
              Buscar Jugador
            </label>
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
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0v1.125c0 1.125.507 2.097 1.307 2.668L12 10.312l5.693-3.519A3.001 3.001 0 0 1 19.5 4.5V3m-15.75 0h15.75m-15.75 0a2.25 2.25 0 0 1 2.25-2.25h11.25a2.25 2.25 0 0 1 2.25 2.25m-15.75 0v1.125"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V15a2.25 2.25 0 0 0-2.25-2.25H4.5A2.25 2.25 0 0 0 2.25 15v3z"
              />
            </svg>
            Ver Evolución
          </button>

          <div className="w-px h-4 bg-slate-300" />

          <EloExplanationModal
            trigger={
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                ¿Cómo funciona el ranking?
              </button>
            }
          />
        </div>
      </div>

      <RankedEvolutionChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        competenciaId={_competenciaId}
        defaultSeasonId={selectedTemporada === 'global' ? undefined : selectedTemporada}
      />

      {comparingPlayers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-2xl border border-brand-200 rounded-full px-6 py-3 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex -space-x-3">
            {selectedPlayers.map((player) => {
              const playerId = getPlayerId(player);
              return (
                <div
                  key={playerId}
                  className="w-10 h-10 rounded-full border-2 border-white bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shadow-sm overflow-hidden"
                >
                  {getInitials(getPlayerName(player, playerId))}
                </div>
              );
            })}
            {comparingPlayers.length < 2 && (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                <span className="text-xl">+</span>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
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

      <CompareVSModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} players={selectedPlayers} />

      {shareConfig.player && (
        <ShareRankModal
          isOpen={shareConfig.isOpen}
          onClose={() => setShareConfig((prev) => ({ ...prev, isOpen: false }))}
          player={shareConfig.player}
          rank={shareConfig.rank}
        />
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <p className="mt-2 text-sm text-slate-500">Cargando ranking...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 text-center text-slate-500">No hay datos de ranking disponibles para esta selección.</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Jugador
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rating (ELO)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Winrate %
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Partidos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tendencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLeaderboard.map((item) => {
                  const originalIndex = leaderboard.findIndex((entry) => getPlayerId(entry) === getPlayerId(item));
                  const playerId = getPlayerId(item);
                  const playerName = getPlayerName(item, playerId);
                  const playerFoto = getPlayerFoto(item, jugadoresComp);
                  const initials = getInitials(playerName);
                  const winrate = item.matchesPlayed > 0 ? ((item.wins ?? 0) / item.matchesPlayed) * 100 : 0;

                  return (
                    <tr
                      key={playerId}
                      className={`transition-all duration-200 cursor-pointer group ${
                        comparingPlayers.includes(playerId)
                          ? 'bg-brand-50 border-l-4 border-brand-500 shadow-inner'
                          : 'hover:bg-brand-50/50 hover:scale-[1.01] hover:shadow-sm'
                      }`}
                      onClick={() => onPlayerClick({ id: playerId, name: playerName })}
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
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  originalIndex === 0
                                    ? 'bg-amber-400 text-white'
                                    : originalIndex === 1
                                      ? 'bg-slate-300 text-white'
                                      : 'bg-amber-600 text-white'
                                }`}
                              >
                                {originalIndex + 1}
                              </span>
                            ) : (
                              originalIndex + 1
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            {playerFoto ? (
                              <img
                                src={playerFoto}
                                alt={playerName}
                                className="absolute inset-0 w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200 shadow-sm z-10 transition-transform group-hover:scale-110"
                              />
                            ) : null}
                            <div className="absolute inset-0 w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold border border-brand-200">
                              {initials}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-slate-900">{playerName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          {Number(item.rating).toFixed(1)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareConfig({ isOpen: true, player: item, rank: originalIndex + 1 });
                            }}
                            className="p-1.5 rounded-full bg-slate-50 text-slate-400 hover:bg-brand-100 hover:text-brand-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Compartir Rank"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-5.314a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-black ${winrate >= 50 ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {winrate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.matchesPlayed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.lastDelta !== undefined ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              item.lastDelta > 0
                                ? 'bg-green-100 text-green-800'
                                : item.lastDelta < 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {item.lastDelta > 0 ? '+' : ''}
                            {Number(item.lastDelta).toFixed(2)}
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
              const originalIndex = leaderboard.findIndex((entry) => getPlayerId(entry) === getPlayerId(item));
              const playerId = getPlayerId(item);
              const playerName = getPlayerName(item, playerId);
              const playerFoto = getPlayerFoto(item, jugadoresComp);
              const initials = getInitials(playerName);
              const winrate = item.matchesPlayed > 0 ? ((item.wins ?? 0) / item.matchesPlayed) * 100 : 0;

              return (
                <div
                  key={playerId}
                  className={`bg-white border rounded-lg p-3 shadow-sm active:scale-95 transition-all cursor-pointer ${
                    comparingPlayers.includes(playerId)
                      ? 'border-brand-400 ring-1 ring-brand-300'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                  onClick={() => onPlayerClick({ id: playerId, name: playerName })}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      {playerFoto ? (
                        <img
                          src={playerFoto}
                          alt={playerName}
                          className="absolute inset-0 w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200 shadow-md z-10"
                        />
                      ) : null}
                      <div className="absolute inset-0 w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold border border-brand-200">
                        {initials}
                      </div>
                      <div
                        className={`absolute -top-1 -left-1 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20 border border-white shadow-sm ${
                          originalIndex === 0
                            ? 'bg-amber-400'
                            : originalIndex === 1
                              ? 'bg-slate-400'
                              : originalIndex === 2
                                ? 'bg-amber-600'
                                : 'bg-slate-800'
                        }`}
                      >
                        {originalIndex + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{playerName}</div>
                      <div className="text-[10px] text-slate-500">{winrate.toFixed(0)}% Winrate</div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-brand-600 leading-none">{Number(item.rating).toFixed(1)}</div>
                      <div className="text-[8px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">RATING</div>
                      {item.lastDelta !== undefined ? (
                        <div
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.lastDelta > 0
                              ? 'bg-green-100 text-green-700'
                              : item.lastDelta < 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.lastDelta > 0 ? '+' : ''}
                          {Number(item.lastDelta).toFixed(1)}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400">---</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2">
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M5.127 4.49a.75.75 0 011.017.346L9 10.428l2.856-5.592a.75.75 0 111.332.678L10 11.635V16a.75.75 0 01-1.5 0v-4.365L5.474 5.507a.75.75 0 01.347-1.016z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareConfig({ isOpen: true, player: item, rank: originalIndex + 1 });
                      }}
                      className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-brand-100 hover:text-brand-600 transition-colors"
                      title="Compartir Rank"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-5.314a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLeaderboard.length === 0 && (
            <div className="p-12 text-center text-slate-500">No se encontraron jugadores que coincidan con tu búsqueda.</div>
          )}
        </>
      )}
    </div>
  );
};

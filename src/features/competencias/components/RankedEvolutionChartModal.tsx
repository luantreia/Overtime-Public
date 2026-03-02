import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RankedService } from '../services/rankedService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RankedEvolutionChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  competenciaId: string;
  seasonId?: string;
  modalidad: string;
  categoria: string;
  leaderboard: any[];
}

export const RankedEvolutionChartModal: React.FC<RankedEvolutionChartModalProps> = ({
  isOpen,
  onClose,
  competenciaId,
  seasonId,
  modalidad,
  categoria,
  leaderboard,
}) => {
  // We'll fetch history for the top players to show evolution
  const topPlayers = leaderboard.slice(0, 20);

  const { data: evolutionaryData, isLoading } = useQuery({
    queryKey: ['ranked-evolution', competenciaId, seasonId, topPlayers.map(p => p.playerId).join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        topPlayers.map(async (player) => {
          const detail = await RankedService.getPlayerDetail(player.playerId, {
            competition: competenciaId,
            season: seasonId,
            modalidad,
            categoria,
          });
          return {
            name: player.playerName,
            history: (detail.history || []).reverse(), // Oldest to newest
          };
        })
      );

      // Transform into a format recharts likes: [{ matchIndex: 0, PlayerA: 1500, PlayerB: 1500 }, ...]
      const maxMatches = Math.max(...results.map(r => r.history.length));
      const chartData: any[] = [];

      for (let i = 0; i < maxMatches; i++) {
        const entry: any = { matchIndex: i + 1 };
        results.forEach(playerData => {
            // Find the rating at this point or use the last available one
            const historyEntry = playerData.history[i];
            if (historyEntry) {
                entry[playerData.name] = historyEntry.postRating;
            } else if (i > 0 && chartData[i-1][playerData.name]) {
                entry[playerData.name] = chartData[i-1][playerData.name];
            }
        });
        chartData.push(entry);
      }

      return { chartData, playerNames: results.map(r => r.name) };
    },
    enabled: isOpen && topPlayers.length > 0,
  });

  if (!isOpen) return null;

  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#64748b'  // slate
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Evolución del Ranking</h3>
            <p className="text-sm text-slate-500">Muestra la evolución del ELO de los mejores 10 jugadores partido a partido.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto bg-slate-50/50">
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mb-4"></div>
                <p className="text-slate-600">Procesando historial de jugadores...</p>
              </div>
            </div>
          ) : evolutionaryData?.chartData.length ? (
            <div className="h-[500px] w-full bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionaryData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="matchIndex" 
                    label={{ value: 'Partidos Jugados', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    label={{ value: 'Rating ELO', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  {evolutionaryData.playerNames.map((name, index) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-slate-500 italic">
              No hay datos suficientes para mostrar la evolución.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

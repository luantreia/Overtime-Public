import React from 'react';
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip
} from 'recharts';
import { ModalBase } from '../../../shared/components/ModalBase/ModalBase';
import { type LeaderboardItem } from '../services/rankedService';

interface CompareVSModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: LeaderboardItem[];
}

export const CompareVSModal: React.FC<CompareVSModalProps> = ({ isOpen, onClose, players }) => {
  if (players.length < 2) return null;

  const player1 = players[0];
  const player2 = players[1];

  // Mocking/Calculating stats for Radar
  // In a real scenario, we might want to fetch more detailed stats, 
  // but for now let's use what we have in LeaderboardItem and some derivation
  const data = [
    {
      subject: 'ELO Rating',
      A: player1.rating,
      B: player2.rating,
      fullMark: Math.max(player1.rating, player2.rating, 2000),
    },
    {
      subject: 'Winrate %',
      A: (player1.wins / (player1.matchesPlayed || 1)) * 100,
      B: (player2.wins / (player2.matchesPlayed || 1)) * 100,
      fullMark: 100,
    },
    {
      subject: 'Partidos',
      A: player1.matchesPlayed,
      B: player2.matchesPlayed,
      fullMark: Math.max(player1.matchesPlayed, player2.matchesPlayed, 50),
    },
    {
      subject: 'Victorias',
      A: player1.wins,
      B: player2.wins,
      fullMark: Math.max(player1.wins, player2.wins, 20),
    },
    {
      subject: 'Tendencia',
      A: Math.max(0, (player1.lastDelta || 0) + 50), // Normalizing delta for visual
      B: Math.max(0, (player2.lastDelta || 0) + 50),
      fullMark: 100,
    },
  ];

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Comparativa Directa (VS)" maxWidth="max-w-4xl">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-8 gap-4 overflow-x-auto pb-2">
          {/* Player 1 Card */}
          <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-black mb-2 shadow-lg">
              {player1.playerName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-sm font-bold text-slate-900 truncate w-full">{player1.playerName}</div>
            <div className="text-[10px] font-black text-brand-600 uppercase tracking-tighter">Player A</div>
          </div>

          <div className="text-2xl font-black text-slate-300 italic">VS</div>

          {/* Player 2 Card */}
          <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black mb-2 shadow-lg">
              {player2.playerName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-sm font-bold text-slate-900 truncate w-full">{player2.playerName}</div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Player B</div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar
                name={player1.playerName || 'Jugador A'}
                dataKey="A"
                stroke="#d946ef"
                fill="#d946ef"
                fillOpacity={0.5}
              />
              <Radar
                name={player2.playerName || 'Jugador B'}
                dataKey="B"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.5}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Highlights</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Mejor Rating:</span>
                <span className="font-bold text-slate-900">
                  {player1.rating > player2.rating ? player1.playerName : player2.playerName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Más Experto:</span>
                <span className="font-bold text-slate-900">
                  {player1.matchesPlayed > player2.matchesPlayed ? player1.playerName : player2.playerName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-4">
            <button 
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg"
            >
              Cerrar Comparativa
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

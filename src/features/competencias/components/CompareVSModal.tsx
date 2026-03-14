import React, { useEffect, useMemo, useState } from 'react';
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
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { RankedService, type LeaderboardItem } from '../services/rankedService';

interface CompareVSModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: LeaderboardItem[];
  modalidad: string;
  categoria: string;
  competition?: string;
  season?: string;
}

interface SetStats {
  won: number;
  lost: number;
}

interface RadarPoint {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

interface VsTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RadarPoint }>;
  label?: string;
  player1Name: string;
  player2Name: string;
  rawBySubject: Record<string, { a: number; b: number }>;
}

const VsTooltip: React.FC<VsTooltipProps> = ({ active, payload, player1Name, player2Name, rawBySubject }) => {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const raw = rawBySubject[point.subject];
  const formatRaw = (value: number) => {
    if (point.subject === 'ELO Rating') return value.toFixed(1);
    if (point.subject === 'Partidos') return `${Math.round(value)} partidos`;
    if (point.subject === 'Victorias') return `${Math.round(value)} victorias`;
    if (point.subject === 'Tendencia') return `${value >= 0 ? '+' : ''}${value.toFixed(1)} Δ`;
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="rounded-xl bg-white shadow-lg border border-slate-200 p-3 min-w-[220px]">
      <div className="text-xs font-black text-slate-700 mb-2">{point.subject}</div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-3">
          <span className="font-bold text-fuchsia-600">{player1Name}</span>
          <span className="text-slate-700">{formatRaw(raw?.a ?? point.A)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="font-bold text-indigo-600">{player2Name}</span>
          <span className="text-slate-700">{formatRaw(raw?.b ?? point.B)}</span>
        </div>
      </div>
    </div>
  );
};

const getSafePlayerId = (player: LeaderboardItem): string => {
  if (typeof player.playerId === 'string') return player.playerId;
  const candidate = player.playerId as unknown as { _id?: string };
  return candidate?._id || '';
};

const computeSetStats = (history: any[]): SetStats => {
  let won = 0;
  let lost = 0;

  for (const item of history || []) {
    const local = Number(item?.partidoId?.marcadorLocal);
    const visitante = Number(item?.partidoId?.marcadorVisitante);
    if (!Number.isFinite(local) || !Number.isFinite(visitante)) continue;

    if (item?.teamColor === 'rojo') {
      won += local;
      lost += visitante;
    } else if (item?.teamColor === 'azul') {
      won += visitante;
      lost += local;
    }
  }

  return { won, lost };
};

export const CompareVSModal: React.FC<CompareVSModalProps> = ({
  isOpen,
  onClose,
  players,
  modalidad,
  categoria,
  competition,
  season,
}) => {
  const hasEnoughPlayers = players.length >= 2;

  const PolarAngleAxisCompat = PolarAngleAxis as unknown as React.ComponentType<any>;
  const PolarRadiusAxisCompat = PolarRadiusAxis as unknown as React.ComponentType<any>;

  const player1 = hasEnoughPlayers
    ? players[0]
    : ({ playerId: '', playerName: 'Jugador A', rating: 0, matchesPlayed: 0, wins: 0 } as LeaderboardItem);
  const player2 = hasEnoughPlayers
    ? players[1]
    : ({ playerId: '', playerName: 'Jugador B', rating: 0, matchesPlayed: 0, wins: 0 } as LeaderboardItem);
  const player1Id = getSafePlayerId(player1);
  const player2Id = getSafePlayerId(player2);
  const [setStatsByPlayer, setSetStatsByPlayer] = useState<Record<string, SetStats>>({});
  const player1Wins = player1.wins ?? 0;
  const player2Wins = player2.wins ?? 0;
  const player1Rating = Number(player1.rating || 0);
  const player2Rating = Number(player2.rating || 0);
  const player1Matches = Number(player1.matchesPlayed || 0);
  const player2Matches = Number(player2.matchesPlayed || 0);

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const normalizeByCap = (value: number, cap: number) => {
    if (cap <= 0) return 0;
    return clamp((value / cap) * 100, 0, 100);
  };

  const eloMin = 700;
  const eloMax = 2200;
  const normalizeElo = (rating: number) => clamp(((rating - eloMin) / (eloMax - eloMin)) * 100, 0, 100);

  const matchesReferenceCap = 120;
  const winsReferenceCap = 80;

  const player1Winrate = (player1Wins / (player1Matches || 1)) * 100;
  const player2Winrate = (player2Wins / (player2Matches || 1)) * 100;

  const player1Trend = Math.max(-50, Math.min(50, Number(player1.lastDelta || 0)));
  const player2Trend = Math.max(-50, Math.min(50, Number(player2.lastDelta || 0)));
  const normalizeTrend = (trend: number) => trend + 50;

  // Mocking/Calculating stats for Radar
  // In a real scenario, we might want to fetch more detailed stats, 
  // but for now let's use what we have in LeaderboardItem and some derivation
  const data = [
    {
      subject: 'ELO Rating',
      A: normalizeElo(player1Rating),
      B: normalizeElo(player2Rating),
      fullMark: 100,
    },
    {
      subject: 'Winrate %',
      A: clamp(player1Winrate, 0, 100),
      B: clamp(player2Winrate, 0, 100),
      fullMark: 100,
    },
    {
      subject: 'Partidos',
      A: normalizeByCap(player1Matches, matchesReferenceCap),
      B: normalizeByCap(player2Matches, matchesReferenceCap),
      fullMark: 100,
    },
    {
      subject: 'Victorias',
      A: normalizeByCap(player1Wins, winsReferenceCap),
      B: normalizeByCap(player2Wins, winsReferenceCap),
      fullMark: 100,
    },
    {
      subject: 'Tendencia',
      A: normalizeTrend(player1Trend),
      B: normalizeTrend(player2Trend),
      fullMark: 100,
    },
  ];

  const rawBySubject: Record<string, { a: number; b: number }> = {
    'ELO Rating': { a: player1Rating, b: player2Rating },
    'Winrate %': { a: player1Winrate, b: player2Winrate },
    'Partidos': { a: player1Matches, b: player2Matches },
    'Victorias': { a: player1Wins, b: player2Wins },
    'Tendencia': { a: Number(player1.lastDelta || 0), b: Number(player2.lastDelta || 0) },
  };

  useEffect(() => {
    let cancelled = false;

    const loadSetStats = async () => {
      if (!isOpen || !hasEnoughPlayers || !player1Id || !player2Id) return;
      try {
        const [detail1, detail2] = await Promise.all([
          RankedService.getPlayerDetail(player1Id, { modalidad, categoria, competition, season }),
          RankedService.getPlayerDetail(player2Id, { modalidad, categoria, competition, season }),
        ]);

        if (cancelled) return;

        setSetStatsByPlayer({
          [player1Id]: computeSetStats(detail1.history || []),
          [player2Id]: computeSetStats(detail2.history || []),
        });
      } catch {
        if (!cancelled) {
          setSetStatsByPlayer({});
        }
      }
    };

    loadSetStats();

    return () => {
      cancelled = true;
    };
  }, [isOpen, hasEnoughPlayers, player1Id, player2Id, modalidad, categoria, competition, season]);

  const player1SetStats = useMemo(() => setStatsByPlayer[player1Id], [setStatsByPlayer, player1Id]);
  const player2SetStats = useMemo(() => setStatsByPlayer[player2Id], [setStatsByPlayer, player2Id]);

  if (!hasEnoughPlayers) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Comparativa Directa (VS)" size="xl">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-8 gap-4 overflow-x-auto pb-2">
          {/* Player 1 Card */}
          <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-black mb-2 shadow-lg">
              {player1.playerName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-sm font-bold text-slate-900 truncate w-full">{player1.playerName}</div>
            <div className="text-[10px] font-black text-brand-600 uppercase tracking-tighter">Player A</div>
            <div className="text-[10px] font-bold text-slate-500 mt-1">
              Sets: {player1SetStats?.won ?? '-'}G / {player1SetStats?.lost ?? '-'}P
            </div>
          </div>

          <div className="text-2xl font-black text-slate-300 italic">VS</div>

          {/* Player 2 Card */}
          <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black mb-2 shadow-lg">
              {player2.playerName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-sm font-bold text-slate-900 truncate w-full">{player2.playerName}</div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Player B</div>
            <div className="text-[10px] font-bold text-slate-500 mt-1">
              Sets: {player2SetStats?.won ?? '-'}G / {player2SetStats?.lost ?? '-'}P
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxisCompat dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
              <PolarRadiusAxisCompat angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
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
                content={<VsTooltip player1Name={player1.playerName || 'Jugador A'} player2Name={player2.playerName || 'Jugador B'} rawBySubject={rawBySubject} />}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-2 text-center text-xs font-medium text-slate-500">
          Ejes normalizados internamente para comparar magnitudes distintas; tooltip muestra valores reales.
        </p>

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

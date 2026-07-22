import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';

interface PlayerInfo {
  id: string;
  name?: string;
  key: string;
  color: string;
}

interface ShareEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: any[];
  playerInfo: PlayerInfo[];
  scope: RankingScope;
}

export const ShareEvolutionModal: React.FC<ShareEvolutionModalProps> = ({
  isOpen,
  onClose,
  chartData,
  playerInfo,
  scope,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(playerInfo[0]?.id || '');

  const selectedPlayer = playerInfo.find((p) => p.id === selectedId) || playerInfo[0];

  const { data, startRating, currentRating, totalDiff } = useMemo(() => {
    if (!selectedPlayer) return { data: [], startRating: 0, currentRating: 0, totalDiff: 0 };
    const key = selectedPlayer.key;
    const points = chartData
      .filter((entry) => entry[key] !== null && entry[key] !== undefined)
      .map((entry) => ({ matchLabel: entry.matchLabel, [key]: entry[key] }));
    const first = points[0]?.[key] ?? 0;
    const last = points[points.length - 1]?.[key] ?? first;
    return { data: points, startRating: first, currentRating: last, totalDiff: last - first };
  }, [chartData, selectedPlayer]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `overtime-evolucion-${(selectedPlayer?.name || 'jugador').replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando evolución:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlayer) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir evolución de ELO" size="md">
      <div className="p-6 flex flex-col items-center">
        {playerInfo.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {playerInfo.map((p) => (
              <option key={p.id} value={p.id}>{p.name || 'Jugador'}</option>
            ))}
          </select>
        )}

        <div
          ref={cardRef}
          className="w-[320px] aspect-[9/16] rounded-3xl overflow-hidden relative shadow-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-8 flex flex-col text-white"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <div className="text-4xl font-black transform rotate-12">OVERTIME</div>
          </div>

          <div className="mb-4">
            <RankingCardHeader scope={scope} />
          </div>

          <div className="my-auto flex flex-col items-center text-center">
            <h2 className="text-3xl font-black mb-6 drop-shadow-md">{selectedPlayer.name || 'Jugador'}</h2>

            <div className="w-full h-32 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <XAxis dataKey="matchLabel" hide />
                  <Line
                    type="stepAfter"
                    dataKey={selectedPlayer.key}
                    stroke="#ffffff"
                    strokeWidth={4}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Inicial</span>
                <span className="text-2xl font-black">{Number(startRating).toFixed(0)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Actual</span>
                <span className="text-2xl font-black">{Number(currentRating).toFixed(0)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Cambio</span>
                <span className={`text-2xl font-black ${totalDiff >= 0 ? '' : 'text-rose-200'}`}>
                  {totalDiff >= 0 ? '+' : ''}{Number(totalDiff).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-white/20 flex justify-center">
            <div className="text-lg font-black tracking-tighter">overtime</div>
          </div>
        </div>

        <div className="mt-8 w-full space-y-3">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-600 text-white font-black text-lg hover:bg-brand-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Generando...' : 'Descargar para Stories'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

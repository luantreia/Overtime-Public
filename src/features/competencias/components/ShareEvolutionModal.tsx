import React, { useMemo, useRef, useState } from 'react';
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { ShareCardShell } from '../../../shared/components/ShareCardShell/ShareCardShell';
import { ShareRatioSwitch, SHARE_RATIO_ASPECT, type ShareRatio } from '../../../shared/components/ShareCardShell/ShareRatioSwitch';
import { ShareDownloadButtons } from '../../../shared/components/ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../../shared/hooks/useShareImage';
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
  const [selectedId, setSelectedId] = useState<string>(playerInfo[0]?.id || '');
  const [ratio, setRatio] = useState<ShareRatio>('story');

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

  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-evolucion-${(selectedPlayer?.name || 'jugador').replace(/\s+/g, '-').toLowerCase()}.png`,
    shareTitle: `Evolución de ELO de ${selectedPlayer?.name || 'jugador'}`,
  });

  if (!selectedPlayer) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir evolución de ELO" size="md" overlayClassName="z-[70]">
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

        <div className="mb-4">
          <ShareRatioSwitch value={ratio} onChange={setRatio} />
        </div>

        <ShareCardShell ref={cardRef} aspectRatio={SHARE_RATIO_ASPECT[ratio]}>
          <div className="px-8 py-6 flex flex-col flex-1 text-white">
          <div className="mb-4">
            <RankingCardHeader scope={scope} />
          </div>

          <div className="my-auto flex flex-col items-center text-center w-full">
            <h2 className="text-3xl font-black mb-6 drop-shadow-md">{selectedPlayer.name || 'Jugador'}</h2>

            <div className="w-full mb-6" style={{ height: ratio === 'square' ? 90 : 128 }}>
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
          </div>
        </ShareCardShell>

        <div className="mt-8 w-full">
          <ShareDownloadButtons
            onShare={handleShare}
            onDownload={handleDownload}
            loadingShare={loadingShare}
            loadingDownload={loadingDownload}
          />
        </div>
      </div>
    </ModalBase>
  );
};

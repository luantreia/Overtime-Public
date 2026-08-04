import React, { useRef, useState } from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { ShareCardShell } from '../../../shared/components/ShareCardShell/ShareCardShell';
import { ShareRatioSwitch, SHARE_RATIO_ASPECT, type ShareRatio } from '../../../shared/components/ShareCardShell/ShareRatioSwitch';
import { ShareDownloadButtons } from '../../../shared/components/ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../../shared/hooks/useShareImage';
import { type LeaderboardItem } from '../services/rankedService';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';

interface ShareRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: LeaderboardItem;
  rank: number;
  playerPhoto?: string;
  scope: RankingScope;
}

export const ShareRankModal: React.FC<ShareRankModalProps> = ({
  isOpen,
  onClose,
  player,
  rank,
  playerPhoto,
  scope,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<ShareRatio>('story');
  const playerName = player.playerName || 'Jugador';
  // Sin foto real no mostramos placeholder de iniciales, y en 1:1 no entra
  // bien junto al resto de las stats — se prioriza el ranking y el ELO.
  const showAvatar = ratio !== 'square' && !!playerPhoto;

  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-rank-${playerName.replace(/\s+/g, '-').toLowerCase()}.png`,
    shareTitle: `Ranking de ${playerName}`,
  });

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir mi Ranking" size="md">
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4">
          <ShareRatioSwitch value={ratio} onChange={setRatio} />
        </div>

        <ShareCardShell ref={cardRef} aspectRatio={SHARE_RATIO_ASPECT[ratio]}>
          <div className="px-8 py-6 flex flex-col flex-1 text-white">
          <div className="my-auto flex flex-col items-center text-center">
            <div className="mb-4">
              <RankingCardHeader scope={scope} />
            </div>

            {showAvatar && (
              <div className="w-28 h-28 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center mb-5 shadow-lg">
                <img src={playerPhoto} alt={playerName} className="w-full h-full rounded-full object-cover" />
              </div>
            )}

            <h2 className="text-3xl font-black mb-8 drop-shadow-md">{playerName}</h2>

            <div className="grid grid-cols-2 gap-6 w-full mb-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Posición</span>
                    <span className="text-4xl font-black">#{rank}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Rating ELO</span>
                    <span className="text-4xl font-black">{Number(player.rating).toFixed(0)}</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 w-full">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">PJ</span>
                    <span className="text-xl font-black">{player.matchesPlayed ?? 0}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">G</span>
                    <span className="text-xl font-black">{player.wins ?? 0}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">E</span>
                    <span className="text-xl font-black">{player.draws ?? 0}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">P</span>
                    <span className="text-xl font-black">{player.losses ?? 0}</span>
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
            hint="Formato optimizado para redes sociales. Compartir abre el selector de apps en móvil."
          />
        </div>
      </div>
    </ModalBase>
  );
};

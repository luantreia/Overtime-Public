import React, { useRef } from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
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
  const playerName = player.playerName || 'Jugador';
  const initials = playerName
    .split(' ')
    .map((token) => token[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-rank-${playerName.replace(/\s+/g, '-').toLowerCase()}.png`,
    shareTitle: `Ranking de ${playerName}`,
  });

  const badge = { color: 'from-brand-600 to-indigo-700' };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir mi Ranking" size="md">
      <div className="p-6 flex flex-col items-center">
        {/* The Capture Area (Instagram Story Style 9:16 approx) */}
        <div 
          ref={cardRef}
          className={`w-[320px] aspect-[9/16] rounded-3xl overflow-hidden relative shadow-2xl bg-gradient-to-br ${badge.color} p-8 flex flex-col text-white`}
        >
          {/* Branding overlay */}
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
             <div className="text-4xl font-black transform rotate-12">OVERTIME</div>
          </div>

          <div className="my-auto flex flex-col items-center text-center">
            <div className="mb-4">
              <RankingCardHeader scope={scope} />
            </div>

            <div className="w-32 h-32 rounded-full border-4 border-white/50 bg-white/20 flex items-center justify-center text-4xl font-black mb-6 shadow-xl backdrop-blur-sm">
              {playerPhoto ? (
                <img src={playerPhoto} alt={playerName} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>

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

          <div className="mt-auto pt-8 border-t border-white/20 flex justify-center">
             <div className="text-lg font-black tracking-tighter">overtime</div>
          </div>
        </div>

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

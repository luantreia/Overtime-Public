import React, { useRef } from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { ShareCardShell } from '../../../shared/components/ShareCardShell/ShareCardShell';
import { ShareDownloadButtons } from '../../../shared/components/ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../../shared/hooks/useShareImage';
import { type LeaderboardItem } from '../services/rankedService';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';

interface ShareTopNModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: LeaderboardItem[];
  n: 3 | 10;
  scope: RankingScope;
}

export const ShareTopNModal: React.FC<ShareTopNModalProps> = ({ isOpen, onClose, players, n, scope }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-top${n}.png`,
    shareTitle: `Top ${n} Overtime`,
  });

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Compartir Top ${n}`} size="md">
      <div className="p-6 flex flex-col items-center">
        <ShareCardShell ref={cardRef} width={480}>
          <div className="px-8 py-6 flex flex-col flex-1 text-white">
            <div className="mb-6">
              <RankingCardHeader scope={scope} />
            </div>

            <div className="space-y-2">
              {players.slice(0, n).map((player, i) => {
                const rank = i + 1;
                const playerName = player.playerName || 'Jugador';
                return (
                  <div
                    key={player.playerId || i}
                    className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5"
                  >
                    <div className="w-8 text-lg font-black opacity-80 shrink-0 text-center">#{rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{playerName}</div>
                      <div className="text-[10px] opacity-70">
                        PJ {player.matchesPlayed ?? 0} · G {player.wins ?? 0} · E {player.draws ?? 0} · P {player.losses ?? 0}
                      </div>
                    </div>
                    <div className="text-lg font-black shrink-0">{Number(player.rating).toFixed(0)}</div>
                  </div>
                );
              })}
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

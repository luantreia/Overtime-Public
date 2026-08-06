import React, { useRef } from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { ShareCardShell } from '../../../shared/components/ShareCardShell/ShareCardShell';
import { ShareDownloadButtons } from '../../../shared/components/ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../../shared/hooks/useShareImage';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';

interface VsPlayer {
  name: string;
  rating: number;
  matchesPlayed: number;
  wins: number;
  setsWon?: number;
  setsLost?: number;
}

interface HeadToHead {
  matches: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
}

interface ShareVSModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1: VsPlayer;
  player2: VsPlayer;
  scope: RankingScope;
  headToHead?: HeadToHead | null;
}

const winrate = (p: VsPlayer) => (p.matchesPlayed > 0 ? (p.wins / p.matchesPlayed) * 100 : 0);

// Sin foto de jugador disponible acá (VsPlayer no la trae), así que en vez de
// un círculo de iniciales permanente (que sería siempre el placeholder que
// no queremos) directamente no hay avatar — el nombre ya identifica a cada uno.
const PlayerStatCol: React.FC<{ player: VsPlayer }> = ({ player }) => (
  <div className="flex-1 flex flex-col items-center text-center">
    <div className="text-sm font-bold truncate w-full">{player.name}</div>
    <div className="mt-3 space-y-1.5 w-full text-xs">
      <div className="flex justify-between"><span className="opacity-70">ELO</span><span className="font-black">{Number(player.rating).toFixed(0)}</span></div>
      <div className="flex justify-between"><span className="opacity-70">Winrate</span><span className="font-black">{winrate(player).toFixed(0)}%</span></div>
      <div className="flex justify-between"><span className="opacity-70">PJ</span><span className="font-black">{player.matchesPlayed}</span></div>
      <div className="flex justify-between"><span className="opacity-70">Sets</span><span className="font-black">{player.setsWon ?? '-'}/{player.setsLost ?? '-'}</span></div>
    </div>
  </div>
);

export const ShareVSModal: React.FC<ShareVSModalProps> = ({ isOpen, onClose, player1, player2, scope, headToHead }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-vs-${player1.name}-${player2.name}`.replace(/\s+/g, '-').toLowerCase() + '.png',
    shareTitle: `${player1.name} vs ${player2.name}`,
  });

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir comparación" size="md">
      <div className="p-6 flex flex-col items-center">
        <ShareCardShell ref={cardRef} width={480}>
          <div className="px-8 py-6 flex flex-col flex-1 text-white">
            <div className="mb-6">
              <RankingCardHeader scope={scope} />
            </div>

            <div className="flex items-center gap-4">
              <PlayerStatCol player={player1} />
              <div className="text-2xl font-black italic opacity-60 shrink-0">VS</div>
              <PlayerStatCol player={player2} />
            </div>

            {headToHead && headToHead.matches > 0 && (
              <div className="mt-6 pt-5 border-t border-white/20 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1.5">
                  Enfrentamientos directos · {headToHead.matches} {headToHead.matches === 1 ? 'partido' : 'partidos'}
                </div>
                <div className="text-2xl font-black">
                  {headToHead.player1Wins} - {headToHead.player2Wins}
                  {headToHead.draws > 0 && <span className="text-sm font-bold opacity-70"> ({headToHead.draws} emp.)</span>}
                </div>
              </div>
            )}
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

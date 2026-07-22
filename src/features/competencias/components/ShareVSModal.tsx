import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';

interface VsPlayer {
  name: string;
  rating: number;
  matchesPlayed: number;
  wins: number;
  setsWon?: number;
  setsLost?: number;
}

interface ShareVSModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1: VsPlayer;
  player2: VsPlayer;
  scope: RankingScope;
}

const winrate = (p: VsPlayer) => (p.matchesPlayed > 0 ? (p.wins / p.matchesPlayed) * 100 : 0);

const PlayerStatCol: React.FC<{ player: VsPlayer; accent: string }> = ({ player, accent }) => (
  <div className="flex-1 flex flex-col items-center text-center">
    <div
      className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center text-xl font-black mb-2 shadow-lg"
      style={{ backgroundColor: accent }}
    >
      {player.name.slice(0, 2).toUpperCase()}
    </div>
    <div className="text-sm font-bold truncate w-full">{player.name}</div>
    <div className="mt-3 space-y-1.5 w-full text-xs">
      <div className="flex justify-between"><span className="opacity-70">ELO</span><span className="font-black">{Number(player.rating).toFixed(0)}</span></div>
      <div className="flex justify-between"><span className="opacity-70">Winrate</span><span className="font-black">{winrate(player).toFixed(0)}%</span></div>
      <div className="flex justify-between"><span className="opacity-70">PJ</span><span className="font-black">{player.matchesPlayed}</span></div>
      <div className="flex justify-between"><span className="opacity-70">Sets</span><span className="font-black">{player.setsWon ?? '-'}/{player.setsLost ?? '-'}</span></div>
    </div>
  </div>
);

export const ShareVSModal: React.FC<ShareVSModalProps> = ({ isOpen, onClose, player1, player2, scope }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `overtime-vs-${player1.name}-${player2.name}`.replace(/\s+/g, '-').toLowerCase() + '.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando comparación:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir comparación" size="md" overlayClassName="z-[70]">
      <div className="p-6 flex flex-col items-center">
        <div
          ref={cardRef}
          className="w-[480px] rounded-3xl overflow-hidden relative shadow-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-8 flex flex-col text-white"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <div className="text-4xl font-black transform rotate-12">OVERTIME</div>
          </div>

          <div className="mb-6">
            <RankingCardHeader scope={scope} />
          </div>

          <div className="flex items-center gap-4">
            <PlayerStatCol player={player1} accent="#d946ef" />
            <div className="text-2xl font-black italic opacity-60 shrink-0">VS</div>
            <PlayerStatCol player={player2} accent="#4f46e5" />
          </div>

          <div className="mt-6 pt-6 border-t border-white/20 flex justify-center">
            <div className="text-lg font-black tracking-tighter">overtime</div>
          </div>
        </div>

        <div className="mt-8 w-full space-y-3">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-600 text-white font-black text-lg hover:bg-brand-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Generando...' : 'Descargar comparación'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

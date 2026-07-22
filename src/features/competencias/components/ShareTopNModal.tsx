import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { type LeaderboardItem } from '../services/rankedService';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';

interface ShareTopNModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: LeaderboardItem[];
  n: 3 | 10;
  scope: RankingScope;
}

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((token) => token[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const ShareTopNModal: React.FC<ShareTopNModalProps> = ({ isOpen, onClose, players, n, scope }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `overtime-top${n}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando Top N:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Compartir Top ${n}`} size="md">
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

          <div className="space-y-2">
            {players.slice(0, n).map((player, i) => {
              const rank = i + 1;
              const playerName = player.playerName || 'Jugador';
              return (
                <div
                  key={player.playerId || i}
                  className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm"
                >
                  <div className="w-8 text-lg font-black opacity-80 shrink-0">#{rank}</div>
                  <div className="w-9 h-9 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center text-xs font-black shrink-0">
                    {getInitials(playerName)}
                  </div>
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
            {loading ? 'Generando...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar Top {n}
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 text-center font-medium">Formato optimizado para captura y redes sociales.</p>
        </div>
      </div>
    </ModalBase>
  );
};

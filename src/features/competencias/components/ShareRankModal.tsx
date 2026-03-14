import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { type LeaderboardItem } from '../services/rankedService';

interface ShareRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: LeaderboardItem;
  rank: number;
}

export const ShareRankModal: React.FC<ShareRankModalProps> = ({ isOpen, onClose, player, rank }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `overtime-rank-${player.playerName?.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error sharing rank:', err);
    } finally {
      setLoading(false);
    }
  };

  const badge = { label: 'Temporada', color: 'from-brand-600 to-indigo-700' };

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
            <div className="text-xl font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Mi Temporada</div>
            
            <div className="w-32 h-32 rounded-full border-4 border-white/50 bg-white/20 flex items-center justify-center text-4xl font-black mb-6 shadow-xl backdrop-blur-sm">
              {player.playerName?.slice(0, 2).toUpperCase()}
            </div>

            <h2 className="text-3xl font-black mb-2 drop-shadow-md">{player.playerName}</h2>
            
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-slate-900 text-sm font-black uppercase mb-8 shadow-lg">
              Rango {badge.label}
            </div>

            <div className="grid grid-cols-2 gap-8 w-full">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Posición</span>
                    <span className="text-4xl font-black">#{rank}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Rating ELO</span>
                    <span className="text-4xl font-black">{Number(player.rating).toFixed(0)}</span>
                </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-white/20 flex justify-between items-end">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60">Competencia oficial</span>
                <span className="text-sm font-bold">Liga Regional</span>
             </div>
             <div className="text-lg font-black tracking-tighter">OVERTIME.app</div>
          </div>
        </div>

        <div className="mt-8 w-full space-y-3">
          <button 
            onClick={handleShare}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-600 text-white font-black text-lg hover:bg-brand-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Generando...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar para Stories
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 text-center font-medium">Formato optimizado para captura y redes sociales.</p>
        </div>
      </div>
    </ModalBase>
  );
};

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';
import { type SynergyPair } from '../services/rankedService';

interface ShareSynergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: SynergyPair;
  scope: RankingScope;
}

const Avatar: React.FC<{ nombre: string; foto?: string; accent: string }> = ({ nombre, foto, accent }) => (
  <div
    className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center text-xl font-black shadow-lg overflow-hidden shrink-0"
    style={{ backgroundColor: accent }}
  >
    {foto ? <img src={foto} alt={nombre} className="w-full h-full object-cover" /> : nombre.slice(0, 2).toUpperCase()}
  </div>
);

export const ShareSynergyModal: React.FC<ShareSynergyModalProps> = ({ isOpen, onClose, pair, scope }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `overtime-dupla-${pair.playerA.nombre}-${pair.playerB.nombre}`.replace(/\s+/g, '-').toLowerCase() + '.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando dupla:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir dupla" size="md">
      <div className="p-6 flex flex-col items-center">
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
            <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-4">Esta dupla es imparable</div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar nombre={pair.playerA.nombre} foto={pair.playerA.foto} accent="#d946ef" />
              <span className="text-lg font-black opacity-60">+</span>
              <Avatar nombre={pair.playerB.nombre} foto={pair.playerB.foto} accent="#4f46e5" />
            </div>
            <h2 className="text-lg font-black mb-6">{pair.playerA.nombre} & {pair.playerB.nombre}</h2>

            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Winrate juntos</span>
                <span className="text-3xl font-black">{pair.winrate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Partidos juntos</span>
                <span className="text-3xl font-black">{pair.gamesTogether}</span>
              </div>
            </div>

            <div className="text-xs font-bold opacity-80">
              {pair.wins}G · {pair.draws}E · {pair.losses}P
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

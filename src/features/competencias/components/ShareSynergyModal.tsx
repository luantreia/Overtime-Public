import React, { useRef, useState } from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { ShareCardShell } from '../../../shared/components/ShareCardShell/ShareCardShell';
import { ShareRatioSwitch, SHARE_RATIO_ASPECT, type ShareRatio } from '../../../shared/components/ShareCardShell/ShareRatioSwitch';
import { ShareDownloadButtons } from '../../../shared/components/ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../../shared/hooks/useShareImage';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';
import { type SynergyPair } from '../services/rankedService';

interface ShareSynergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: SynergyPair;
  scope: RankingScope;
}

// Sin foto real no mostramos placeholder de iniciales — mismo criterio que
// el resto de las tarjetas (Radar, Rank).
const Avatar: React.FC<{ nombre: string; foto?: string }> = ({ nombre, foto }) => {
  if (!foto) return null;
  return (
    <div className="w-16 h-16 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
      <img src={foto} alt={nombre} className="w-full h-full object-cover" />
    </div>
  );
};

export const ShareSynergyModal: React.FC<ShareSynergyModalProps> = ({ isOpen, onClose, pair, scope }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<ShareRatio>('story');
  const showAvatars = ratio !== 'square';
  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-dupla-${pair.playerA.nombre}-${pair.playerB.nombre}`.replace(/\s+/g, '-').toLowerCase() + '.png',
    shareTitle: `${pair.playerA.nombre} & ${pair.playerB.nombre}`,
  });

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir dupla" size="md">
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4">
          <ShareRatioSwitch value={ratio} onChange={setRatio} />
        </div>

        <ShareCardShell ref={cardRef} aspectRatio={SHARE_RATIO_ASPECT[ratio]}>
          <div className="px-8 py-6 flex flex-col flex-1 text-white">
          <div className="mb-4">
            <RankingCardHeader scope={scope} />
          </div>

          <div className="my-auto flex flex-col items-center text-center w-full">
            <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-4">Esta dupla es imparable</div>
            {showAvatars && (pair.playerA.foto || pair.playerB.foto) && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <Avatar nombre={pair.playerA.nombre} foto={pair.playerA.foto} />
                <span className="text-lg font-black opacity-60">+</span>
                <Avatar nombre={pair.playerB.nombre} foto={pair.playerB.foto} />
              </div>
            )}
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

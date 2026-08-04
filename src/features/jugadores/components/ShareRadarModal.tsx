import React, { useRef, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { ShareCardShell } from '../../../shared/components/ShareCardShell/ShareCardShell';
import { ShareRatioSwitch, SHARE_RATIO_ASPECT, type ShareRatio } from '../../../shared/components/ShareCardShell/ShareRatioSwitch';
import { ShareDownloadButtons } from '../../../shared/components/ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../../shared/hooks/useShareImage';

const PolarAngleAxisCompat = PolarAngleAxis as unknown as React.ComponentType<any>;

interface RadarData {
  power: number;
  stamina: number;
  precision: number;
  consistency: number;
  versatility: number;
}

interface ShareRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  radarData: RadarData;
  playerName: string;
  playerPhoto?: string;
}

export const ShareRadarModal: React.FC<ShareRadarModalProps> = ({
  isOpen,
  onClose,
  radarData,
  playerName,
  playerPhoto,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<ShareRatio>('story');
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  // Sin foto real no mostramos el círculo con iniciales (queda vacío/feo), y en
  // 1:1 directamente no entra bien junto al resto — se prioriza el gráfico.
  const showAvatar = ratio !== 'square' && !!playerPhoto;

  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-radar-${playerName.replace(/\s+/g, '-').toLowerCase()}.png`,
    shareTitle: `Radar de atleta de ${playerName}`,
  });

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir radar de atleta" size="md">
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4">
          <ShareRatioSwitch value={ratio} onChange={setRatio} />
        </div>

        <ShareCardShell ref={cardRef} aspectRatio={SHARE_RATIO_ASPECT[ratio]}>
          <div className="px-8 pt-6 flex flex-col flex-1 text-white">
            <div className="text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.25em] opacity-70">LoD</div>
              <div className="text-lg font-bold uppercase tracking-wide mt-0.5">Radar de Atleta</div>
              <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Últimos 30 días · {hoy}</div>
            </div>

            <div className="my-auto flex flex-col items-center text-center w-full">
              {showAvatar && (
                <div className="w-20 h-20 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center mb-3 shadow-lg">
                  <img src={playerPhoto} alt={playerName} className="w-full h-full rounded-full object-cover" />
                </div>
              )}
              <h2 className="text-2xl font-black mb-4 drop-shadow-md">{playerName}</h2>

              <div className="w-full" style={{ height: ratio === 'square' ? 110 : 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={[
                      { subject: 'Poder', A: radarData.power },
                      { subject: 'Resist.', A: radarData.stamina },
                      { subject: 'Precisión', A: radarData.precision },
                      { subject: 'Consist.', A: radarData.consistency },
                      { subject: 'Versat.', A: radarData.versatility },
                    ]}
                  >
                    <PolarGrid stroke="rgba(255,255,255,0.3)" />
                    <PolarAngleAxisCompat dataKey="subject" tick={{ fill: '#ffffff', fontSize: 9, fontWeight: 700 }} />
                    <Radar dataKey="A" stroke="#ffffff" strokeWidth={2} fill="#ffffff" fillOpacity={0.35} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
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

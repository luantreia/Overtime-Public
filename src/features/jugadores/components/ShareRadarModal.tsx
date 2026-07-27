import React, { useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
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
  const initials = playerName.split(' ').map((t) => t[0]).join('').slice(0, 2).toUpperCase();
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-radar-${playerName.replace(/\s+/g, '-').toLowerCase()}.png`,
    shareTitle: `Radar de atleta de ${playerName}`,
  });

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir radar de atleta" size="md">
      <div className="p-6 flex flex-col items-center">
        <div
          ref={cardRef}
          className="w-[320px] aspect-[9/16] rounded-3xl overflow-hidden relative shadow-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-8 flex flex-col text-white"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <div className="text-4xl font-black transform rotate-12">OVERTIME</div>
          </div>

          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] opacity-70">LoD</div>
            <div className="text-lg font-bold uppercase tracking-wide mt-0.5">Radar de Atleta</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Últimos 30 días · {hoy}</div>
          </div>

          <div className="my-auto flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full border-4 border-white/50 bg-white/20 flex items-center justify-center text-2xl font-black mb-3 shadow-xl backdrop-blur-sm">
              {playerPhoto ? (
                <img src={playerPhoto} alt={playerName} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <h2 className="text-2xl font-black mb-4 drop-shadow-md">{playerName}</h2>

            <div className="w-full h-40">
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

          <div className="mt-auto pt-6 border-t border-white/20 flex justify-center">
            <div className="text-lg font-black tracking-tighter">overtime</div>
          </div>
        </div>

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

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';

interface LaPlazaPlayer {
  player: { nombre: string; alias?: string; foto?: string };
}

interface ShareLaPlazaResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  locationName?: string;
  scheduledDate: string;
  scoreA: number;
  scoreB: number;
  teamA: LaPlazaPlayer[];
  teamB: LaPlazaPlayer[];
}

const PlayerAvatars: React.FC<{ players: LaPlazaPlayer[] }> = ({ players }) => (
  <div className="flex -space-x-2 justify-center">
    {players.slice(0, 6).map((p, i) => {
      const name = p.player.nombre || 'Jugador';
      const initials = name.split(' ').map((t) => t[0]).join('').slice(0, 2).toUpperCase();
      return (
        <div
          key={i}
          className="w-9 h-9 rounded-full border-2 border-white/60 bg-white/20 flex items-center justify-center text-[10px] font-black overflow-hidden shrink-0"
        >
          {p.player.foto ? <img src={p.player.foto} alt={name} className="w-full h-full object-cover" /> : initials}
        </div>
      );
    })}
  </div>
);

export const ShareLaPlazaResultModal: React.FC<ShareLaPlazaResultModalProps> = ({
  isOpen,
  onClose,
  title,
  locationName,
  scheduledDate,
  scoreA,
  scoreB,
  teamA,
  teamB,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const fecha = new Date(scheduledDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `overtime-la-plaza-resultado.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando resultado de La Plaza:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir resultado" size="md">
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
            <div className="text-lg font-bold uppercase tracking-wide mt-0.5">La Plaza</div>
            {locationName && <div className="text-xs font-semibold opacity-80 mt-0.5">{locationName}</div>}
            <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{fecha}</div>
          </div>

          <div className="my-auto flex flex-col items-center text-center">
            <h2 className="text-lg font-bold mb-6 opacity-90 truncate max-w-full">{title}</h2>

            <div className="grid grid-cols-3 items-center w-full gap-2 mb-6">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Rojo</span>
                <PlayerAvatars players={teamA} />
              </div>
              <div className="text-3xl font-black">{scoreA} - {scoreB}</div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Azul</span>
                <PlayerAvatars players={teamB} />
              </div>
            </div>

            <div className="text-sm font-black uppercase tracking-wide">
              {scoreA > scoreB ? '¡Victoria Roja!' : scoreB > scoreA ? '¡Victoria Azul!' : '¡Empate!'}
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

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../ModalBase/ModalBase';
import { formatDate, formatDateTime } from '../../utils/formatDate';

interface PartidoShare {
  equipoLocal?: { nombre?: string };
  equipoVisitante?: { nombre?: string; rival?: string };
  rival?: string;
  marcadorLocal?: number;
  marcadorVisitante?: number;
  estado?: string;
  fecha?: string;
  hora?: string;
  competencia?: { nombre?: string };
  escenario?: string;
}

interface SharePartidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partido: PartidoShare;
}

const initials = (name?: string) =>
  (name || '?')
    .split(' ')
    .map(t => t[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const badgeLabel: Record<string, string> = {
  finalizado: 'Finalizado',
  en_juego: 'En vivo',
  programado: 'Próximo',
};

export const SharePartidoModal: React.FC<SharePartidoModalProps> = ({ isOpen, onClose, partido }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const localNombre = partido.equipoLocal?.nombre || 'Local';
  const visitanteNombre = partido.equipoVisitante?.nombre || partido.rival || 'Visitante';
  const estado = partido.estado || 'programado';
  const mostrarMarcador = estado === 'finalizado' || estado === 'en_juego';
  const fechaTexto = partido.fecha && partido.hora
    ? formatDateTime(`${partido.fecha}T${partido.hora}`)
    : partido.fecha
    ? formatDate(partido.fecha)
    : null;

  const filename = `overtime-${localNombre.replace(/\s+/g, '-').toLowerCase()}-vs-${visitanteNombre.replace(/\s+/g, '-').toLowerCase()}.png`;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });

      // Try Web Share API with file (mobile — opens native share sheet incl. Instagram)
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `${localNombre} vs ${visitanteNombre}` });
          return;
        }
      } catch {
        // Web Share API not available or cancelled — fall through to download
      }

      // Desktop fallback: download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generando imagen:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir partido" size="md">
      <div className="p-6 flex flex-col items-center">
        {/* Card a capturar — formato story 9:16 */}
        <div
          ref={cardRef}
          className="w-[300px] aspect-[9/16] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col select-none"
          style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #1e1b4b 100%)' }}
        >
          {/* Marca de agua decorativa */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <span className="text-white text-[90px] font-black tracking-tighter rotate-[-20deg]">OT</span>
          </div>

          {/* Top branding */}
          <div className="px-7 pt-8 pb-2 flex items-center justify-between">
            <span className="text-white/90 text-sm font-black tracking-[0.2em] uppercase">Overtime</span>
            {estado === 'en_juego' && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping inline-block" />
                En vivo
              </span>
            )}
            {estado !== 'en_juego' && (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 uppercase tracking-wide">
                {badgeLabel[estado] || estado}
              </span>
            )}
          </div>

          {/* Competencia */}
          {partido.competencia?.nombre && (
            <div className="px-7 mt-1">
              <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">
                {partido.competencia.nombre}
              </span>
            </div>
          )}

          {/* Enfrentamiento */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            {/* Local */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {initials(localNombre)}
              </div>
              <span className="text-white font-bold text-base text-center leading-tight max-w-[160px]">
                {localNombre}
              </span>
            </div>

            {/* Marcador / VS */}
            {mostrarMarcador ? (
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-white tabular-nums">{partido.marcadorLocal ?? 0}</span>
                <span className="text-2xl font-bold text-white/30">-</span>
                <span className="text-5xl font-black text-white tabular-nums">{partido.marcadorVisitante ?? 0}</span>
              </div>
            ) : (
              <span className="text-3xl font-black text-white/30">VS</span>
            )}

            {/* Visitante */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {initials(visitanteNombre)}
              </div>
              <span className="text-white font-bold text-base text-center leading-tight max-w-[160px]">
                {visitanteNombre}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 pb-8 pt-4 border-t border-white/10 flex items-end justify-between">
            <div className="flex flex-col gap-0.5">
              {fechaTexto && (
                <span className="text-white/50 text-[11px] font-medium">{fechaTexto}</span>
              )}
              {partido.escenario && (
                <span className="text-white/40 text-[10px]">{partido.escenario}</span>
              )}
            </div>
            <span className="text-white/30 text-xs font-black tracking-tight">overtime</span>
          </div>
        </div>

        {/* Acción */}
        <div className="mt-6 w-full space-y-2">
          <button
            onClick={handleShare}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              'Generando...'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                </svg>
                Compartir en Stories
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 text-center">
            En móvil se abre el selector de apps · En escritorio descarga la imagen
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

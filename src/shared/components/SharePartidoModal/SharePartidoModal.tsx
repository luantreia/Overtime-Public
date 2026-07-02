import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../ModalBase/ModalBase';
import { formatDate, formatDateTime } from '../../utils/formatDate';

interface PartidoShare {
  equipoLocal?: { nombre?: string; escudo?: string };
  equipoVisitante?: { nombre?: string; escudo?: string; rival?: string };
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

const getInitials = (name?: string) =>
  (name || '?').split(' ').map(t => t[0]).join('').slice(0, 2).toUpperCase();

const badgeLabel: Record<string, string> = {
  finalizado: 'Finalizado',
  en_juego: 'En vivo',
  programado: 'Próximo',
};

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export const SharePartidoModal: React.FC<SharePartidoModalProps> = ({ isOpen, onClose, partido }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [localEscudo, setLocalEscudo] = useState<string | null>(null);
  const [visitanteEscudo, setVisitanteEscudo] = useState<string | null>(null);

  const localNombre = partido.equipoLocal?.nombre || 'Local';
  const visitanteNombre = partido.equipoVisitante?.nombre || partido.rival || 'Visitante';
  const estado = partido.estado || 'programado';
  const mostrarMarcador = estado === 'finalizado' || estado === 'en_juego';

  // Fecha programada del partido
  const fechaTexto = partido.fecha && partido.hora
    ? formatDateTime(`${partido.fecha}T${partido.hora}`)
    : partido.fecha
    ? formatDate(partido.fecha)
    : null;

  const filename = `partido-${localNombre.replace(/\s+/g, '-').toLowerCase()}-vs-${visitanteNombre.replace(/\s+/g, '-').toLowerCase()}.png`;

  // Pre-fetch shields as data URLs so html-to-image can embed them (avoids CORS blank)
  useEffect(() => {
    if (!isOpen) return;
    setLocalEscudo(null);
    setVisitanteEscudo(null);
    if (partido.equipoLocal?.escudo) {
      toDataUrl(partido.equipoLocal.escudo).then(setLocalEscudo);
    }
    if (partido.equipoVisitante?.escudo) {
      toDataUrl(partido.equipoVisitante.escudo).then(setVisitanteEscudo);
    }
  }, [isOpen, partido.equipoLocal?.escudo, partido.equipoVisitante?.escudo]);

  const generatePng = async (): Promise<{ dataUrl: string; blob: Blob } | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { dataUrl, blob };
  };

  const handleShare = async () => {
    setLoadingShare(true);
    try {
      const result = await generatePng();
      if (!result) return;
      const { dataUrl, blob } = result;
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${localNombre} vs ${visitanteNombre}` });
      } else {
        // Desktop: no Web Share API → download as fallback
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Error compartiendo:', err);
    } finally {
      setLoadingShare(false);
    }
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    try {
      const result = await generatePng();
      if (!result) return;
      const link = document.createElement('a');
      link.download = filename;
      link.href = result.dataUrl;
      link.click();
    } catch (err) {
      console.error('Error descargando:', err);
    } finally {
      setLoadingDownload(false);
    }
  };

  const renderEscudo = (dataUrl: string | null, nombre: string) => {
    if (dataUrl) {
      return (
        <img
          src={dataUrl}
          alt={nombre}
          className="h-20 w-20 rounded-full object-cover border-2 border-white/20 shadow-lg bg-white/10"
        />
      );
    }
    return (
      <div className="h-20 w-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-lg">
        {getInitials(nombre)}
      </div>
    );
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
          {/* Top: estado + competencia */}
          <div className="px-7 pt-8 pb-2 flex items-center justify-between">
            {partido.competencia?.nombre ? (
              <span className="text-white/60 text-[11px] font-semibold uppercase tracking-wider flex-1 truncate pr-2">
                {partido.competencia.nombre}
              </span>
            ) : <span />}
            {estado === 'en_juego' ? (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide flex-shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping inline-block" />
                En vivo
              </span>
            ) : (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 uppercase tracking-wide flex-shrink-0">
                {badgeLabel[estado] || estado}
              </span>
            )}
          </div>

          {/* Enfrentamiento */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            {/* Local */}
            <div className="flex flex-col items-center gap-3">
              {renderEscudo(localEscudo, localNombre)}
              <span className="text-white font-bold text-base text-center leading-tight max-w-[180px]">
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
              {renderEscudo(visitanteEscudo, visitanteNombre)}
              <span className="text-white font-bold text-base text-center leading-tight max-w-[180px]">
                {visitanteNombre}
              </span>
            </div>
          </div>

          {/* Footer: fecha + escenario */}
          <div className="px-7 pb-8 pt-4 border-t border-white/10 flex flex-col gap-0.5">
            {fechaTexto && (
              <span className="text-white/50 text-[11px] font-medium">{fechaTexto}</span>
            )}
            {partido.escenario && (
              <span className="text-white/35 text-[10px]">{partido.escenario}</span>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 w-full flex gap-3">
          <button
            onClick={handleShare}
            disabled={loadingShare || loadingDownload}
            className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all shadow active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingShare ? '…' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                </svg>
                Compartir
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={loadingShare || loadingDownload}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingDownload ? '…' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
                Descargar
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 text-center">
          Compartir abre el selector de apps en móvil
        </p>
      </div>
    </ModalBase>
  );
};

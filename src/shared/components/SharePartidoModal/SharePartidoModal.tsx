import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import ModalBase from '../ModalBase/ModalBase';

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

// Format partido.fecha (ISO date string) into readable parts
function parseFecha(fecha?: string, hora?: string) {
  if (!fecha) return null;
  // fecha might be "2025-07-15" or a full ISO string
  const dateStr = fecha.includes('T') ? fecha : `${fecha}T00:00:00`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const MONTH_NAMES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return {
    dayName: DAY_NAMES[d.getDay()],
    datePart: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    timePart: hora ? `${hora} hs` : null,
  };
}

export const SharePartidoModal: React.FC<SharePartidoModalProps> = ({ isOpen, onClose, partido }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingAnimated, setLoadingAnimated] = useState(false);
  const [localEscudo, setLocalEscudo] = useState<string | null>(null);
  const [visitanteEscudo, setVisitanteEscudo] = useState<string | null>(null);

  const localNombre = partido.equipoLocal?.nombre || 'Local';
  const visitanteNombre = partido.equipoVisitante?.nombre || partido.rival || 'Visitante';
  const estado = partido.estado || 'programado';
  const mostrarMarcador = estado === 'finalizado' || estado === 'en_juego';
  const fechaParsed = parseFecha(partido.fecha, partido.hora);
  const filename = `partido-${localNombre.replace(/\s+/g, '-').toLowerCase()}-vs-${visitanteNombre.replace(/\s+/g, '-').toLowerCase()}.png`;

  useEffect(() => {
    if (!isOpen) return;
    setLocalEscudo(null);
    setVisitanteEscudo(null);
    if (partido.equipoLocal?.escudo) toDataUrl(partido.equipoLocal.escudo).then(setLocalEscudo);
    if (partido.equipoVisitante?.escudo) toDataUrl(partido.equipoVisitante.escudo).then(setVisitanteEscudo);
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

  const handleShareAnimated = async () => {
    if (!cardRef.current) return;
    setLoadingAnimated(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = dataUrl; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      const mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
        ? 'video/webm;codecs=vp9'
        : (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm'))
        ? 'video/webm'
        : null;

      if (!mimeType) {
        // Fallback: compartir imagen estática si no hay soporte de video
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `${localNombre} vs ${visitanteNombre}` });
        }
        return;
      }

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start();

      const DURATION = 2200;
      const startTime = performance.now();

      await new Promise<void>(resolve => {
        const draw = (now: number) => {
          const t = Math.min((now - startTime) / DURATION, 1);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // Shimmer diagonal sweep: entra por la izquierda, sale por la derecha
          const cx = (t * 1.6 - 0.3) * canvas.width;
          const shimmer = ctx.createLinearGradient(cx - 120, 0, cx + 120, canvas.height * 0.6);
          shimmer.addColorStop(0, 'rgba(255,255,255,0)');
          shimmer.addColorStop(0.4, 'rgba(255,255,255,0.06)');
          shimmer.addColorStop(0.5, 'rgba(255,255,255,0.18)');
          shimmer.addColorStop(0.6, 'rgba(255,255,255,0.06)');
          shimmer.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = shimmer;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (t < 1) { requestAnimationFrame(draw); }
          else { recorder.stop(); resolve(); }
        };
        requestAnimationFrame(draw);
      });

      await new Promise<void>(resolve => { recorder.onstop = () => resolve(); });

      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const videoFilename = filename.replace('.png', `.${ext}`);
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], videoFilename, { type: mimeType });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${localNombre} vs ${visitanteNombre}` });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = videoFilename;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Error animado:', err);
    } finally {
      setLoadingAnimated(false);
    }
  };

  const renderEscudo = (dataUrl: string | null, nombre: string, size = 72) => {
    const sz = `${size}px`;
    if (dataUrl) {
      return (
        <img
          src={dataUrl}
          alt={nombre}
          style={{ width: sz, height: sz, borderRadius: '50%', objectFit: 'cover',
            border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)' }}
        />
      );
    }
    return (
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', fontWeight: 900, color: 'white',
      }}>
        {getInitials(nombre)}
      </div>
    );
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir partido" size="md">
      <div className="p-6 flex flex-col items-center">

        {/* ── Card capturada ── */}
        <div
          ref={cardRef}
          style={{
            width: 320,
            aspectRatio: '3/4',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'linear-gradient(165deg, #0a0f1e 0%, #0f172a 45%, #13103a 100%)',
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'none',
            position: 'relative',
          }}
        >
          {/* Glow central decorativo */}
          <div style={{
            position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Stripe superior — borde de color de la card */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #4f46e5 100%)', flexShrink: 0 }} />

          {/* ── HEADER ── */}
          <div style={{ padding: '20px 24px 12px' }}>
            {/* Badge de estado — alineado a la derecha */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              {estado === 'en_juego' ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#ef4444', color: 'white',
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'inline-block'
                  }} />
                  En vivo
                </span>
              ) : (
                <span style={{
                  display: 'inline-block',
                  background: estado === 'finalizado' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.25)',
                  color: estado === 'finalizado' ? '#6ee7b7' : '#a5b4fc',
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {estado === 'finalizado' ? 'Finalizado' : 'Próximo partido'}
                </span>
              )}
            </div>

            {/* Nombre de la competencia — línea separada, puede wrappear */}
            {partido.competencia?.nombre && (
              <div style={{
                color: 'rgba(255,255,255,0.55)', fontSize: 12,
                fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                lineHeight: 1.3,
              }}>
                {partido.competencia.nombre}
              </div>
            )}

            {/* Línea accent */}
            <div style={{
              marginTop: 8, height: 2, borderRadius: 1,
              background: 'linear-gradient(90deg, #6366f1, #818cf8, transparent)',
            }} />
          </div>

          {/* ── ENFRENTAMIENTO ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 20px 0' }}>
            {/* Cancha de dodgeball como fondo — 18x9m proporcional */}
            <div style={{ position: 'relative', width: '100%' }}>
              {/* SVG cancha */}
              <svg
                viewBox="0 0 18 9"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Fondo cancha */}
                <rect x="0" y="0" width="18" height="9" fill="rgba(255,255,255,0.025)" rx="0.4" />
                {/* Borde cancha */}
                <rect x="0.1" y="0.1" width="17.8" height="8.8" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.18" rx="0.3" />
                {/* Línea de habilitación local (6m) */}
                <line x1="6" y1="0.1" x2="6" y2="8.9" stroke="rgba(255,255,255,0.1)" strokeWidth="0.13" strokeDasharray="0.4 0.25" />
                {/* Línea central (9m) */}
                <line x1="9" y1="0.1" x2="9" y2="8.9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.16" />
                {/* Línea de habilitación visitante (12m) */}
                <line x1="12" y1="0.1" x2="12" y2="8.9" stroke="rgba(255,255,255,0.1)" strokeWidth="0.13" strokeDasharray="0.4 0.25" />
              </svg>

              {/* Equipos sobre la cancha */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', padding: '18px 0', gap: 0 }}>

                {/* Local */}
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 12, textAlign: 'center',
                }}>
                  {renderEscudo(localEscudo, localNombre, 64)}
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 13, lineHeight: 1.25, maxWidth: 100 }}>
                    {localNombre}
                  </div>
                </div>

                {/* Centro: VS o marcador */}
                <div style={{ width: 72, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {mostrarMarcador ? (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 34, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                        {partido.marcadorLocal ?? 0}
                      </span>
                      <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>-</span>
                      <span style={{ fontSize: 34, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                        {partido.marcadorVisitante ?? 0}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                      VS
                    </span>
                  )}
                </div>

                {/* Visitante */}
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 12, textAlign: 'center',
                }}>
                  {renderEscudo(visitanteEscudo, visitanteNombre, 64)}
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 13, lineHeight: 1.25, maxWidth: 100 }}>
                    {visitanteNombre}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Separador entre equipos y fecha */}
          <div style={{ margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* ── FECHA DESTACADA ── */}
          {fechaParsed && (
            <div style={{ padding: '12px 24px 0' }}>
              <div style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(165,180,252,0.9)" width="14" height="14">
                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {fechaParsed.dayName}
                  </div>
                  <div style={{ color: 'white', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>
                    {fechaParsed.datePart}
                    {fechaParsed.timePart && (
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginLeft: 8, fontSize: 12 }}>
                        {fechaParsed.timePart}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ESCENARIO ── */}
          {partido.escenario && (
            <div style={{ padding: '8px 24px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" width="12" height="12">
                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.079 3.405-4.442 3.405-7.827a8.25 8.25 0 0 0-16.5 0c0 3.385 1.46 5.748 3.405 7.827a19.58 19.58 0 0 0 2.683 2.282 16.975 16.975 0 0 0 1.144.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 500 }}>
                {partido.escenario}
              </span>
            </div>
          )}

          {/* Detalle inferior — línea con rombo centrado */}
          <div style={{ padding: '10px 24px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.3))' }} />
            <div style={{
              width: 6, height: 6, borderRadius: 1, flexShrink: 0,
              background: 'rgba(99,102,241,0.5)',
              transform: 'rotate(45deg)',
            }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.3))' }} />
          </div>
        </div>

        {/* ── Botones ── */}
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
        <button
          onClick={handleShareAnimated}
          disabled={loadingShare || loadingDownload || loadingAnimated}
          className="mt-2 w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingAnimated ? 'Generando video…' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-brand-500">
                <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
              </svg>
              Compartir como video animado
            </>
          )}
        </button>
        <p className="mt-1.5 text-[10px] text-slate-400 text-center">
          Compartir abre el selector de apps en móvil
        </p>
      </div>
    </ModalBase>
  );
};

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import ModalBase from '../ModalBase/ModalBase';
import { ShareDownloadButtons } from '../ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../hooks/useShareImage';

interface JugadorShare {
  id?: string;
  nombre: string;
  equipo: 'local' | 'visitante';
}

interface SetShare {
  numeroSet: number;
  ganador?: 'local' | 'visitante' | 'empate';
}

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
  jugadores?: JugadorShare[];
  sets?: SetShare[];
  modalidad?: string;
}

interface SharePartidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partido: PartidoShare;
}

type Ratio = 'card' | 'story' | 'square';

const RATIO_ASPECT: Record<Ratio, string> = {
  card: '3 / 4',
  story: '9 / 16',
  square: '1 / 1',
};

const COLOR_LOCAL = '#dc2626';
const COLOR_VISITANTE = '#2b45db';
const COLOR_TIE = '#f59e0b';

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
    dateShort: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
    timePart: hora ? `${hora} hs` : null,
  };
}

export const SharePartidoModal: React.FC<SharePartidoModalProps> = ({ isOpen, onClose, partido }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [localEscudo, setLocalEscudo] = useState<string | null>(null);
  const [visitanteEscudo, setVisitanteEscudo] = useState<string | null>(null);
  const [ratio, setRatio] = useState<Ratio>('card');

  const jugadores = partido.jugadores || [];
  const localJugadores = jugadores.filter((j) => j.equipo === 'local');
  const visitanteJugadores = jugadores.filter((j) => j.equipo === 'visitante');
  const hayJugadores = jugadores.length > 0;
  const [incluirJugadores, setIncluirJugadores] = useState(true);
  const [playerCap, setPlayerCap] = useState(9);

  const localNombre = partido.equipoLocal?.nombre || 'Local';
  const visitanteNombre = partido.equipoVisitante?.nombre || partido.rival || 'Visitante';
  const estado = partido.estado || 'programado';
  const mostrarMarcador = estado === 'finalizado' || estado === 'en_juego';
  const fechaParsed = parseFecha(partido.fecha, partido.hora);
  const filename = `partido-${localNombre.replace(/\s+/g, '-').toLowerCase()}-vs-${visitanteNombre.replace(/\s+/g, '-').toLowerCase()}.png`;
  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename,
    shareTitle: `${localNombre} vs ${visitanteNombre}`,
  });

  const marcadorLocal = partido.marcadorLocal ?? 0;
  const marcadorVisitante = partido.marcadorVisitante ?? 0;
  const winnerSide = mostrarMarcador && marcadorLocal !== marcadorVisitante
    ? (marcadorLocal > marcadorVisitante ? 'local' : 'visitante')
    : null;

  // 1:1 no tiene lugar para header + marcador + timeline + fecha + footer + jugadores
  // legibles a la vez, así que ahí directamente no se muestra la lista de jugadores.
  const showingPlayers = incluirJugadores && hayJugadores && ratio !== 'square';
  // El badge chico de fecha solo hace falta en Post cuando además hay jugadores;
  // en el resto de los casos entra perfecto el bloque de fecha completo.
  const compactDate = showingPlayers && ratio === 'card';

  useEffect(() => {
    if (!isOpen) return;
    setLocalEscudo(null);
    setVisitanteEscudo(null);
    if (partido.equipoLocal?.escudo) toDataUrl(partido.equipoLocal.escudo).then(setLocalEscudo);
    if (partido.equipoVisitante?.escudo) toDataUrl(partido.equipoVisitante.escudo).then(setVisitanteEscudo);
  }, [isOpen, partido.equipoLocal?.escudo, partido.equipoVisitante?.escudo]);

  // Mide el alto real de la tarjeta renderizada y va sacando jugadores (de a uno, de
  // ambos equipos a la vez) hasta que el contenido entra sin recortarse contra el
  // borde — en vez de asumir un número fijo de filas que "debería" entrar.
  useLayoutEffect(() => {
    if (!isOpen || !showingPlayers || !cardRef.current) return;
    const applyCap = (value: number) => flushSync(() => setPlayerCap(value));
    let cap = Math.max(localJugadores.length, visitanteJugadores.length, 1);
    applyCap(cap);
    let guard = 20;
    while (
      cap > 0 &&
      cardRef.current &&
      cardRef.current.scrollHeight > cardRef.current.clientHeight + 1 &&
      guard-- > 0
    ) {
      cap -= 1;
      applyCap(cap);
    }
  }, [isOpen, showingPlayers, ratio, localJugadores.length, visitanteJugadores.length, partido.sets?.length]);

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

  const sets = partido.sets || [];
  const puntosPorSet = partido.modalidad === 'Cloth' ? 2 : 1;
  const setColor = (g?: 'local' | 'visitante' | 'empate') =>
    g === 'local' ? COLOR_LOCAL : g === 'visitante' ? COLOR_VISITANTE : g === 'empate' ? COLOR_TIE : 'rgba(255,255,255,0.25)';

  const RATIO_OPTIONS: { value: Ratio; label: string }[] = [
    { value: 'card', label: 'Post (3:4)' },
    { value: 'story', label: 'Story (9:16)' },
    { value: 'square', label: 'Cuadrado (1:1)' },
  ];

  const dateBadge = fechaParsed && (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(255,255,255,0.16)', color: 'white',
      padding: '3px 10px', borderRadius: 999, fontSize: 9.5, fontWeight: 700,
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="9" height="9">
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
      </svg>
      {fechaParsed.dateShort}{fechaParsed.timePart ? ` · ${fechaParsed.timePart}` : ''}
    </span>
  );

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir partido" size="md">
      <div className="p-6 flex flex-col items-center">

        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
            {RATIO_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRatio(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  ratio === opt.value ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hayJugadores && (
            <label className={`flex items-center gap-2 text-sm text-slate-600 ${ratio === 'square' ? 'opacity-50' : ''}`}>
              <input
                type="checkbox"
                checked={incluirJugadores}
                disabled={ratio === 'square'}
                onChange={(e) => setIncluirJugadores(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Incluir lista de jugadores
              {ratio === 'square' && <span className="italic text-slate-400">(no disponible en 1:1)</span>}
            </label>
          )}
        </div>

        {/* ── Card capturada ── */}
        <div
          ref={cardRef}
          style={{
            width: 320,
            aspectRatio: RATIO_ASPECT[ratio],
            borderRadius: 24,
            overflow: 'hidden',
            background: 'linear-gradient(155deg, #2b45db 0%, #4338ca 100%)',
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'none',
            position: 'relative',
            transition: 'aspect-ratio 0.15s ease',
          }}
        >
          {/* Glow central decorativo */}
          <div style={{
            position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Stripe superior */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />

          {/* ── HEADER ── */}
          <div style={{ padding: compactDate ? '12px 24px 8px' : '20px 24px 12px' }}>
            <div style={{ display: 'flex', justifyContent: compactDate ? 'space-between' : 'flex-end', alignItems: 'center', marginBottom: 10 }}>
              {compactDate && dateBadge}
              {estado === 'en_juego' ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#ef4444', color: 'white',
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'inline-block' }} />
                  En vivo
                </span>
              ) : (
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.22)',
                  color: 'white',
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {estado === 'finalizado' ? 'Finalizado' : 'Próximo partido'}
                </span>
              )}
            </div>

            {partido.competencia?.nombre && (
              <div style={{
                color: 'rgba(255,255,255,0.6)', fontSize: 12,
                fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                lineHeight: 1.3,
              }}>
                {partido.competencia.nombre}
              </div>
            )}

            <div style={{
              marginTop: 8, height: 2, borderRadius: 1,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.7), transparent)',
            }} />
          </div>

          {/* ── ENFRENTAMIENTO (escudos + marcador) ── */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px 0', gap: 0 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
              {renderEscudo(localEscudo, localNombre, 48)}
              <div style={{ color: 'white', fontWeight: 800, fontSize: 12, lineHeight: 1.2, maxWidth: 100 }}>
                {localNombre}
              </div>
            </div>

            <div style={{ width: 72, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mostrarMarcador ? (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: winnerSide === 'local' ? 32 : 22, fontWeight: 900, lineHeight: 1,
                    color: winnerSide === 'local' ? 'white' : 'rgba(255,255,255,0.55)',
                    textShadow: winnerSide === 'local' ? '0 0 18px rgba(255,255,255,0.5)' : 'none',
                    transition: 'font-size 0.15s, color 0.15s',
                  }}>
                    {marcadorLocal}
                  </span>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>-</span>
                  <span style={{
                    fontSize: winnerSide === 'visitante' ? 32 : 22, fontWeight: 900, lineHeight: 1,
                    color: winnerSide === 'visitante' ? 'white' : 'rgba(255,255,255,0.55)',
                    textShadow: winnerSide === 'visitante' ? '0 0 18px rgba(255,255,255,0.5)' : 'none',
                    transition: 'font-size 0.15s, color 0.15s',
                  }}>
                    {marcadorVisitante}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 15, fontWeight: 900, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                  VS
                </span>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
              {renderEscudo(visitanteEscudo, visitanteNombre, 48)}
              <div style={{ color: 'white', fontWeight: 800, fontSize: 12, lineHeight: 1.2, maxWidth: 100 }}>
                {visitanteNombre}
              </div>
            </div>
          </div>

          {/* ── LÍNEA DE TIEMPO DE SETS + JUGADORES ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 20px 0' }}>
            {sets.length > 0 && (() => {
              // Con muchos sets (empates a repetición, sudden death, etc.) los puntos
              // se achican y hacen wrap a más filas en vez de desbordar el ancho fijo
              // de la tarjeta o pisarse unos con otros.
              const pipSize = sets.length > 16 ? 14 : sets.length > 10 ? 17 : 20;
              const pipFont = sets.length > 16 ? 7.5 : sets.length > 10 ? 8 : 9;
              return (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4, rowGap: 5 }}>
                    {sets.map((s) => (
                      <div key={s.numeroSet} style={{
                        width: pipSize, height: pipSize, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: pipFont, fontWeight: 800, color: 'rgba(0,0,0,0.55)',
                        border: '1.5px solid rgba(255,255,255,0.6)',
                        background: setColor(s.ganador),
                      }}>
                        {s.numeroSet}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 8.5, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4,
                  }}>
                    Set a set{partido.modalidad === 'Cloth' ? ` · gana +${puntosPorSet}` : ''}
                  </div>
                </>
              );
            })()}

            {showingPlayers && (
              <div style={{ display: 'flex', marginTop: 12, gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  {localJugadores.slice(0, playerCap).map((j, i) => (
                    <div key={j.id || i} style={{
                      display: 'flex', alignItems: 'center', gap: 5, fontSize: 8.5, fontWeight: 700,
                      color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fca5a1', flexShrink: 0 }} />
                      {j.nombre}
                    </div>
                  ))}
                  {localJugadores.length > playerCap && (
                    <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                      +{localJugadores.length - playerCap} más
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, alignItems: 'flex-end' }}>
                  {visitanteJugadores.slice(0, playerCap).map((j, i) => (
                    <div key={j.id || i} style={{
                      display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 5, fontSize: 8.5, fontWeight: 700,
                      color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a8b3f7', flexShrink: 0 }} />
                      {j.nombre}
                    </div>
                  ))}
                  {visitanteJugadores.length > playerCap && (
                    <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textAlign: 'right', width: '100%' }}>
                      +{visitanteJugadores.length - playerCap} más
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Separador */}
          <div style={{ margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* ── FECHA DESTACADA (bloque completo) ── */}
          {fechaParsed && !compactDate && (
            <div style={{ padding: '12px 24px 0' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 14, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" width="14" height="14">
                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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

          {/* Detalle inferior */}
          <div style={{ padding: compactDate ? '6px 24px 10px' : '10px 24px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3))' }} />
            <div style={{
              width: 6, height: 6, borderRadius: 1, flexShrink: 0,
              background: 'rgba(255,255,255,0.5)',
              transform: 'rotate(45deg)',
            }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.3))' }} />
          </div>
        </div>

        {/* ── Botones ── */}
        <ShareDownloadButtons
          className="mt-6"
          onShare={handleShare}
          onDownload={handleDownload}
          loadingShare={loadingShare}
          loadingDownload={loadingDownload}
        />
      </div>
    </ModalBase>
  );
};

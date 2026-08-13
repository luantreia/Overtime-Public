import React, { useMemo, useState } from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { formatDate } from '../../../shared/utils/formatDate';
import type { Equipo } from '../services/equipoService';

interface EquipoHistoriaModalProps {
  equipo: Equipo;
  equipoId: string;
  competenciasMap?: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
  /** Si se pasa, cada detalle de temporada ofrece un atajo para abrir su ficha completa. */
  onVerTemporada?: (args: { competenciaId: string; temporadaId: string; temporadas: { _id: string; nombre: string }[] }) => void;
}

// Paleta categórica validada (dataviz skill): 8 tonos en orden fijo, asignados
// en orden de primera aparición. La 9na competencia en adelante cae en el gris.
const PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const OTRAS_COLOR = '#94a3b8';

type TemporadaEvento = {
  /** Id de la participación (equipo-temporada): sirve de key en React, no identifica la temporada. */
  id: string;
  /** Id real de la Temporada, el que espera EquipoCompetenciaModal. */
  temporadaId: string;
  nombre: string;
  competenciaId: string;
  competenciaNombre: string;
  inicio: number;
  fin: number;
  /** Sin fecha de fin cargada: se asume que sigue en curso y el tramo llega hasta hoy. */
  enCurso: boolean;
  gano: boolean;
};

type Carril = {
  competenciaId: string;
  competenciaNombre: string;
  color: string;
  temporadas: TemporadaEvento[];
  titulos: number;
};

const toTimestamp = (value: unknown): number | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

export const EquipoHistoriaModal: React.FC<EquipoHistoriaModalProps> = ({
  equipo,
  equipoId,
  competenciasMap = {},
  isOpen,
  onClose,
  onVerTemporada,
}) => {
  const fundacion = toTimestamp(equipo.fechaFormacion);
  const ahora = Date.now();
  const [seleccion, setSeleccion] = useState<string | null>(null);

  const temporadas = useMemo<TemporadaEvento[]>(() => {
    return (equipo.participaciontemporadas || [])
      .map((p: any): TemporadaEvento | null => {
        const inicio = toTimestamp(p?.temporada?.fechaInicio);
        if (!inicio) return null;
        const finCargado = toTimestamp(p?.temporada?.fechaFin);
        const competenciaRef = p?.temporada?.competencia;
        const competenciaId = typeof competenciaRef === 'string'
          ? competenciaRef
          : (competenciaRef?._id || competenciaRef?.id || 'sin-competencia');
        const competenciaNombre = competenciasMap[competenciaId]?.nombre
          || (typeof competenciaRef !== 'string' && competenciaRef?.nombre)
          || 'Competencia';
        return {
          id: p._id,
          temporadaId: p?.temporada?._id || p._id,
          nombre: p.temporada?.nombre || 'Temporada',
          competenciaId,
          competenciaNombre,
          inicio,
          fin: Math.max(finCargado ?? ahora, inicio),
          enCurso: finCargado === null,
          gano: Boolean(p?.temporada?.ganador) && String(p.temporada.ganador) === String(equipoId),
        };
      })
      .filter((t): t is TemporadaEvento => t !== null)
      .sort((a, b) => a.inicio - b.inicio);
  }, [equipo, equipoId, competenciasMap, ahora]);

  // Un carril por competencia: agrupa todas sus temporadas en el mismo renglón, en vez de
  // repetir el nombre de la competencia una vez por temporada.
  const carriles = useMemo<Carril[]>(() => {
    const map = new Map<string, Carril>();
    temporadas.forEach((t) => {
      if (!map.has(t.competenciaId)) {
        const slot = map.size;
        map.set(t.competenciaId, {
          competenciaId: t.competenciaId,
          competenciaNombre: t.competenciaNombre,
          color: slot < PALETTE.length ? PALETTE[slot] : OTRAS_COLOR,
          temporadas: [],
          titulos: 0,
        });
      }
      const carril = map.get(t.competenciaId)!;
      carril.temporadas.push(t);
      if (t.gano) carril.titulos += 1;
    });
    return Array.from(map.values());
  }, [temporadas]);

  const { min, max } = useMemo(() => {
    const puntos = [...(fundacion ? [fundacion] : []), ...temporadas.flatMap((t) => [t.inicio, t.fin])];
    if (puntos.length === 0) return { min: 0, max: 0 };
    const lo = Math.min(...puntos);
    const hi = Math.max(...puntos, ahora);
    const padding = Math.max((hi - lo) * 0.04, 1000 * 60 * 60 * 24 * 30);
    return { min: lo - padding, max: hi + padding };
  }, [fundacion, temporadas, ahora]);

  const rango = max - min;
  const posicion = (t: number) => (rango > 0 ? ((t - min) / rango) * 100 : 0);
  const hoyVisible = rango > 0 && ahora >= min && ahora <= max;

  const years = useMemo(() => {
    if (rango <= 0) return [] as { year: number; left: number }[];
    const first = new Date(min).getUTCFullYear();
    const last = new Date(max).getUTCFullYear();
    const list: { year: number; left: number }[] = [];
    for (let y = first; y <= last; y++) {
      const jan1 = Date.UTC(y, 0, 1);
      if (jan1 >= min && jan1 <= max) list.push({ year: y, left: ((jan1 - min) / rango) * 100 });
    }
    return list;
  }, [min, max, rango]);

  const sinDatos = !fundacion && temporadas.length === 0;

  if (!isOpen) return null;

  return (
    <ModalBase onClose={onClose} title="Línea de tiempo" size="lg">
      <div className="p-4 sm:p-6">
        {sinDatos ? (
          <EmptyState message="No hay fechas cargadas para armar la línea de tiempo de este equipo." />
        ) : (
          <div className="relative">
            {/* Línea de "hoy": atraviesa todo el gráfico para ubicar de un vistazo qué está en curso. */}
            {hoyVisible && (
              <div
                className="pointer-events-none absolute inset-y-0 z-10 -translate-x-1/2"
                style={{ left: `${posicion(ahora)}%` }}
              >
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  hoy
                </span>
                <div className="mt-4 h-full w-px border-l border-dashed border-brand-300" />
              </div>
            )}

            <div className="space-y-5">
              {/* Eje de años */}
              <div className="relative h-6">
                {years.map(({ year, left }) => (
                  <div key={year} className="absolute top-0 flex h-full flex-col items-center" style={{ left: `${left}%` }}>
                    <span className="text-[10px] font-medium text-slate-400">{year}</span>
                    <div className="mt-1 w-px flex-1 bg-slate-100" />
                  </div>
                ))}
              </div>

              {/* Fundación */}
              {fundacion && (
                <div className="relative h-8">
                  <div
                    className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                    style={{ left: `${posicion(fundacion)}%` }}
                  >
                    <span className="h-3 w-3 rounded-full bg-slate-700 ring-2 ring-white" />
                    <span className="mt-1 whitespace-nowrap text-[10px] font-semibold text-slate-600">
                      Fundación · {formatDate(equipo.fechaFormacion)}
                    </span>
                  </div>
                </div>
              )}

              {/* Un carril por competencia, con todas sus temporadas como tramos del mismo renglón */}
              {carriles.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Este equipo no tiene temporadas con fechas cargadas.</p>
              ) : (
                <div className="space-y-4">
                  {carriles.map((carril) => {
                    const detalle = carril.temporadas.find((t) => t.id === seleccion);
                    const soloUna = carril.temporadas.length === 1;

                    return (
                      <div key={carril.competenciaId}>
                        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: carril.color }} />
                            {carril.competenciaId !== 'sin-competencia' ? (
                              <a
                                href={`/competencias/${carril.competenciaId}`}
                                className="truncate font-medium text-slate-700 hover:text-brand-600 hover:underline"
                              >
                                {carril.competenciaNombre}
                              </a>
                            ) : (
                              <span className="truncate font-medium text-slate-700">{carril.competenciaNombre}</span>
                            )}
                          </span>
                          <span className="flex-shrink-0 text-slate-400">
                            {carril.temporadas.length} temporada{carril.temporadas.length !== 1 ? 's' : ''}
                            {carril.titulos > 0 && ` · ${carril.titulos} 🏆`}
                          </span>
                        </div>

                        <div className="relative h-6 rounded-full bg-slate-100">
                          {carril.temporadas.map((t) => {
                            const left = posicion(t.inicio);
                            const width = Math.max(posicion(t.fin) - left, 2.2);
                            const centro = left + width / 2;
                            const activa = seleccion === t.id;
                            return (
                              <React.Fragment key={t.id}>
                                <button
                                  type="button"
                                  onClick={() => setSeleccion((prev) => (prev === t.id ? null : t.id))}
                                  className={`absolute inset-y-0 rounded-full transition-[filter,box-shadow] hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                                    t.enCurso ? 'animate-pulse' : ''
                                  } ${activa ? 'ring-2 ring-offset-1 ring-brand-500' : ''}`}
                                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: carril.color }}
                                  aria-pressed={activa}
                                  aria-label={`${t.nombre}, del ${formatDate(new Date(t.inicio))} al ${t.enCurso ? 'hoy (en curso)' : formatDate(new Date(t.fin))}${t.gano ? ', campeón' : ''}`}
                                />
                                {t.gano && (
                                  <span
                                    className="pointer-events-none absolute -top-3.5 -translate-x-1/2 text-[11px] leading-none"
                                    style={{ left: `${centro}%` }}
                                    aria-hidden="true"
                                  >
                                    🏆
                                  </span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Debajo del carril: si solo hay una temporada se muestra directo (no hay
                            nada que desordenar); si hay varias, tocar un tramo revela su detalle acá,
                            en vez de repetir una línea de texto por temporada. */}
                        {soloUna ? (
                          <p className="mt-1 text-[11px] text-slate-500">
                            {carril.temporadas[0].nombre} · {formatDate(new Date(carril.temporadas[0].inicio))} –{' '}
                            {carril.temporadas[0].enCurso ? 'en curso' : formatDate(new Date(carril.temporadas[0].fin))}
                          </p>
                        ) : (
                          <div className="mt-1 flex min-h-[18px] items-center justify-between gap-2 text-[11px] text-slate-500">
                            {detalle ? (
                              <>
                                <span>
                                  {detalle.nombre} · {formatDate(new Date(detalle.inicio))} –{' '}
                                  {detalle.enCurso ? 'en curso' : formatDate(new Date(detalle.fin))}
                                  {detalle.gano && ' · campeón'}
                                </span>
                                {onVerTemporada && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onVerTemporada({
                                        competenciaId: carril.competenciaId,
                                        temporadaId: detalle.temporadaId,
                                        temporadas: carril.temporadas.map((t) => ({ _id: t.temporadaId, nombre: t.nombre })),
                                      })
                                    }
                                    className="flex-shrink-0 font-semibold text-brand-600 hover:underline"
                                  >
                                    Ver detalle →
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="italic text-slate-400">Tocá una temporada para ver el detalle.</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
};

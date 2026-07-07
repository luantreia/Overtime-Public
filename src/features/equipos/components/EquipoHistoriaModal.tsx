import React, { useMemo } from 'react';
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
}

// Paleta categórica validada (dataviz skill): 8 tonos en orden fijo, asignados
// en orden de primera aparición. La 9na competencia en adelante cae en el gris.
const PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const OTRAS_COLOR = '#94a3b8';

type TemporadaEvento = {
  id: string;
  nombre: string;
  competenciaId: string;
  competenciaNombre: string;
  inicio: number;
  fin: number;
  gano: boolean;
};

const toTimestamp = (value: unknown): number | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

export const EquipoHistoriaModal: React.FC<EquipoHistoriaModalProps> = ({ equipo, equipoId, competenciasMap = {}, isOpen, onClose }) => {
  const fundacion = toTimestamp(equipo.fechaFormacion);

  const temporadas = useMemo<TemporadaEvento[]>(() => {
    return (equipo.participaciontemporadas || [])
      .map((p: any): TemporadaEvento | null => {
        const inicio = toTimestamp(p?.temporada?.fechaInicio);
        if (!inicio) return null;
        const fin = toTimestamp(p?.temporada?.fechaFin) ?? inicio;
        const competenciaRef = p?.temporada?.competencia;
        const competenciaId = typeof competenciaRef === 'string'
          ? competenciaRef
          : (competenciaRef?._id || competenciaRef?.id || 'sin-competencia');
        const competenciaNombre = competenciasMap[competenciaId]?.nombre
          || (typeof competenciaRef !== 'string' && competenciaRef?.nombre)
          || 'Competencia';
        return {
          id: p._id,
          nombre: p.temporada?.nombre || 'Temporada',
          competenciaId,
          competenciaNombre,
          inicio,
          fin: Math.max(fin, inicio),
          gano: Boolean(p?.temporada?.ganador) && String(p.temporada.ganador) === String(equipoId),
        };
      })
      .filter((t): t is TemporadaEvento => t !== null)
      .sort((a, b) => a.inicio - b.inicio);
  }, [equipo, equipoId, competenciasMap]);

  const colorPorCompetencia = useMemo(() => {
    const map = new Map<string, string>();
    temporadas.forEach((t) => {
      if (!map.has(t.competenciaId)) {
        const slot = map.size;
        map.set(t.competenciaId, slot < PALETTE.length ? PALETTE[slot] : OTRAS_COLOR);
      }
    });
    return map;
  }, [temporadas]);

  const competenciasUnicas = useMemo(() => {
    const seen = new Map<string, string>();
    temporadas.forEach((t) => {
      if (!seen.has(t.competenciaId)) seen.set(t.competenciaId, t.competenciaNombre);
    });
    return Array.from(seen.entries());
  }, [temporadas]);

  const { min, max } = useMemo(() => {
    const puntos = [...(fundacion ? [fundacion] : []), ...temporadas.flatMap((t) => [t.inicio, t.fin])];
    if (puntos.length === 0) return { min: 0, max: 0 };
    const lo = Math.min(...puntos);
    const hi = Math.max(...puntos, Date.now());
    const padding = Math.max((hi - lo) * 0.04, 1000 * 60 * 60 * 24 * 30);
    return { min: lo - padding, max: hi + padding };
  }, [fundacion, temporadas]);

  const rango = max - min;
  const posicion = (t: number) => (rango > 0 ? ((t - min) / rango) * 100 : 0);

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
    <ModalBase onClose={onClose} title="Línea de tiempo" size="xl">
      <div className="p-4 sm:p-6">
        {sinDatos ? (
          <EmptyState message="No hay fechas cargadas para armar la línea de tiempo de este equipo." />
        ) : (
          <div className="space-y-6">
            {/* Eje de años */}
            <div className="relative h-6">
              {years.map(({ year, left }) => (
                <div
                  key={year}
                  className="absolute top-0 flex h-full flex-col items-center"
                  style={{ left: `${left}%` }}
                >
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

            {/* Temporadas */}
            {temporadas.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Este equipo no tiene temporadas con fechas cargadas.</p>
            ) : (
              <div className="space-y-4">
                {temporadas.map((t) => {
                  const color = colorPorCompetencia.get(t.competenciaId) || OTRAS_COLOR;
                  const left = posicion(t.inicio);
                  const width = Math.max(posicion(t.fin) - left, 1.5);
                  return (
                    <div key={t.id}>
                      <div className="mb-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium text-slate-700">{t.nombre}</span>
                        <span className="text-slate-400">· {t.competenciaNombre}</span>
                        <span className="text-slate-400">· {formatDate(new Date(t.inicio))} – {formatDate(new Date(t.fin))}</span>
                        {t.gano && <span title="Campeón de esta temporada">🏆</span>}
                      </div>
                      <div className="relative h-4 rounded-full bg-slate-100">
                        <div
                          className="absolute inset-y-0 rounded-full transition-[filter] hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                          style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
                          tabIndex={0}
                          role="img"
                          aria-label={`${t.nombre}, ${t.competenciaNombre}, del ${formatDate(new Date(t.inicio))} al ${formatDate(new Date(t.fin))}${t.gano ? ', campeón' : ''}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Leyenda: solo si hay 2+ competencias distintas */}
            {competenciasUnicas.length >= 2 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
                {competenciasUnicas.map(([cid, nombre]) => (
                  <span key={cid} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorPorCompetencia.get(cid) }} />
                    {nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalBase>
  );
};

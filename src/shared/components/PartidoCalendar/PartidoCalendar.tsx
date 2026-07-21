import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PartidoCard from '../PartidoCard';
import ModalBase from '../ModalBase/ModalBase';
import { EstadisticasPartidoModal } from '../EstadisticasPartidoModal';
import SegmentedToggle from '../SegmentedToggle/SegmentedToggle';
import { type Partido } from '../../../features/partidos/services/partidoService';

export type Escala = 'anual' | 'mensual' | 'semanal';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ESTADO_DOT: Record<string, string> = {
  programado: 'bg-slate-400',
  en_juego: 'bg-amber-500',
  finalizado: 'bg-emerald-500',
  cancelado: 'bg-red-400',
};

const pad = (n: number) => String(n).padStart(2, '0');

const dayKeyFromFecha = (fecha?: string): string => (fecha ? fecha.slice(0, 10) : '');

const dayKeyFromDate = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const todayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

const addDaysUTC = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);
const addMonthsUTC = (date: Date, months: number) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
const addYearsUTC = (date: Date, years: number) => new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), 1));

// JS getUTCDay(): 0=Dom..6=Sáb -> convertimos a semana que arranca Lunes (0=Lun..6=Dom)
const mondayIndex = (jsDay: number) => (jsDay + 6) % 7;

const getWeekDays = (anchor: Date): Date[] => {
  const start = addDaysUTC(anchor, -mondayIndex(anchor.getUTCDay()));
  return Array.from({ length: 7 }, (_, i) => addDaysUTC(start, i));
};

const getMonthGridDays = (anchor: Date): Date[] => {
  const firstOfMonth = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const start = addDaysUTC(firstOfMonth, -mondayIndex(firstOfMonth.getUTCDay()));
  return Array.from({ length: 42 }, (_, i) => addDaysUTC(start, i));
};

const fechaHoraValue = (p: Partido): number => {
  const iso = p.fecha && p.hora ? `${p.fecha}T${p.hora}` : p.fecha;
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

const defaultLabel = (p: Partido): string => {
  const local = p.equipoLocal?.nombre || 'Local';
  const visitante = p.equipoVisitante?.nombre || 'Visitante';
  return `${local} vs ${visitante}`;
};

const MAX_CHIPS_MENSUAL = 2;
const MAX_CHIPS_SEMANAL = 3;

export interface PartidoCalendarProps {
  partidos: Partido[];
  escalaInicial?: Escala;
  labelFn?: (p: Partido) => string;
  onPartidoClick?: (p: Partido) => void;
}

export const PartidoCalendar: React.FC<PartidoCalendarProps> = ({
  partidos,
  escalaInicial = 'mensual',
  labelFn = defaultLabel,
  onPartidoClick,
}) => {
  const navigate = useNavigate();
  const [escala, setEscala] = useState<Escala>(escalaInicial);
  const [cursor, setCursor] = useState<Date>(todayUTC());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [partidoStats, setPartidoStats] = useState<Partido | null>(null);

  const partidosPorDia = useMemo(() => {
    const map = new Map<string, Partido[]>();
    partidos.forEach((p) => {
      const key = dayKeyFromFecha(p.fecha);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    map.forEach((lista) => lista.sort((a, b) => fechaHoraValue(a) - fechaHoraValue(b)));
    return map;
  }, [partidos]);

  const hoyKey = useMemo(() => dayKeyFromDate(todayUTC()), []);

  const navegar = (delta: 1 | -1) => {
    if (escala === 'semanal') setCursor((c) => addDaysUTC(c, delta * 7));
    else if (escala === 'mensual') setCursor((c) => addMonthsUTC(c, delta));
    else setCursor((c) => addYearsUTC(c, delta));
  };

  const irAHoy = () => setCursor(todayUTC());

  const handlePartidoClick = (p: Partido) => {
    if (onPartidoClick) onPartidoClick(p);
    else navigate(`/partidos/${p.id || p._id}`);
  };

  const renderPartido = (p: Partido, variante: 'proximo' | 'resultado') => (
    <PartidoCard
      key={p.id || p._id}
      partido={p}
      variante={variante}
      onClick={() => handlePartidoClick(p)}
      actions={
        variante === 'resultado' && p.sets && p.sets.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPartidoStats(p);
            }}
            className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            📊 Ver estadísticas
          </button>
        ) : null
      }
    />
  );

  const renderDayCell = (
    date: Date,
    opts: { compact?: boolean; fueraDeMes?: boolean; maxChips: number }
  ) => {
    const key = dayKeyFromDate(date);
    const items = partidosPorDia.get(key) || [];
    const esHoy = key === hoyKey;
    const tieneOverflow = items.length > opts.maxChips;
    const visibles = items.slice(0, opts.maxChips);

    return (
      <button
        key={key}
        type="button"
        disabled={items.length === 0}
        onClick={() => setDiaSeleccionado(key)}
        className={`flex flex-col items-stretch rounded-lg border p-1 sm:p-1.5 text-left transition-colors ${
          opts.compact ? 'min-h-[40px] sm:min-h-[52px]' : 'min-h-[52px] sm:min-h-[88px]'
        } ${
          opts.fueraDeMes ? 'border-transparent bg-slate-50/50 opacity-40' : 'border-slate-100 bg-white'
        } ${items.length > 0 ? 'hover:border-brand-300 hover:shadow-sm cursor-pointer' : 'cursor-default'} ${
          esHoy ? 'ring-1 ring-inset ring-brand-400' : ''
        }`}
      >
        <span className={`text-[11px] font-semibold ${esHoy ? 'text-brand-600' : 'text-slate-500'}`}>
          {date.getUTCDate()}
        </span>
        {opts.compact ? (
          items.length > 0 && (
            <span className="mt-1 flex flex-wrap gap-0.5">
              {items.slice(0, 4).map((p, i) => (
                <span key={p.id || p._id || i} className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT[p.estado || 'programado']}`} />
              ))}
            </span>
          )
        ) : (
          <>
            {/* Mobile: solo puntos de estado, el detalle completo se ve al tocar el día */}
            {items.length > 0 && (
              <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                {items.slice(0, 6).map((p, i) => (
                  <span key={p.id || p._id || i} className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT[p.estado || 'programado']}`} />
                ))}
              </span>
            )}
            {/* Desktop: nombres de los partidos, hay espacio para mostrarlos */}
            <div className="mt-1 hidden space-y-0.5 sm:block">
              {visibles.map((p, i) => (
                <span key={p.id || p._id || i} className="flex items-center gap-1 truncate text-[10px] font-medium text-slate-600">
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${ESTADO_DOT[p.estado || 'programado']}`} />
                  <span className="truncate">{labelFn(p)}</span>
                </span>
              ))}
              {tieneOverflow && (
                <span className="block text-[10px] font-semibold text-brand-600">
                  +{items.length - opts.maxChips} más
                </span>
              )}
            </div>
          </>
        )}
      </button>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <SegmentedToggle
          className="w-full justify-between sm:w-auto sm:justify-start"
          options={[
            { value: 'semanal', label: 'Semanal' },
            { value: 'mensual', label: 'Mensual' },
            { value: 'anual', label: 'Anual' },
          ]}
          value={escala}
          onChange={(v) => setEscala(v as Escala)}
        />
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => navegar(-1)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            ‹
          </button>
          <button onClick={irAHoy} className="px-3 h-8 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
            Hoy
          </button>
          <button onClick={() => navegar(1)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            ›
          </button>
        </div>
      </div>

      {escala === 'semanal' && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            Semana del {getWeekDays(cursor)[0].getUTCDate()} de {MONTHS[getWeekDays(cursor)[0].getUTCMonth()]}
          </h3>
          <div className="grid grid-cols-7 gap-1.5">
            {getWeekDays(cursor).map((date, i) => (
              <div key={i} className="space-y-1">
                <div className="text-center text-[10px] font-bold uppercase text-slate-400">{WEEKDAYS[i]}</div>
                {renderDayCell(date, { maxChips: MAX_CHIPS_SEMANAL })}
              </div>
            ))}
          </div>
        </div>
      )}

      {escala === 'mensual' && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            {MONTHS[cursor.getUTCMonth()]} {cursor.getUTCFullYear()}
          </h3>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-[10px] font-bold uppercase text-slate-400">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {getMonthGridDays(cursor).map((date) =>
              renderDayCell(date, { fueraDeMes: date.getUTCMonth() !== cursor.getUTCMonth(), maxChips: MAX_CHIPS_MENSUAL })
            )}
          </div>
        </div>
      )}

      {escala === 'anual' && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-600">{cursor.getUTCFullYear()}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MONTHS.map((mes, i) => {
              const mesAnchor = new Date(Date.UTC(cursor.getUTCFullYear(), i, 1));
              return (
                <div key={mes} className="border border-slate-100 rounded-xl p-3">
                  <button
                    onClick={() => {
                      setCursor(mesAnchor);
                      setEscala('mensual');
                    }}
                    className="mb-2 text-xs font-bold text-slate-700 hover:text-brand-600"
                  >
                    {mes}
                  </button>
                  <div className="grid grid-cols-7 gap-0.5">
                    {getMonthGridDays(mesAnchor).map((date) => renderDayCell(date, { compact: true, fueraDeMes: date.getUTCMonth() !== i, maxChips: 0 }))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {diaSeleccionado && (
        <ModalBase
          onClose={() => setDiaSeleccionado(null)}
          title={`Partidos del ${diaSeleccionado.split('-').reverse().join('/')}`}
          size="md"
        >
          <div className="p-4 space-y-3">
            {(partidosPorDia.get(diaSeleccionado) || []).map((p) => renderPartido(p, p.estado === 'finalizado' ? 'resultado' : 'proximo'))}
          </div>
        </ModalBase>
      )}

      {partidoStats && (
        <EstadisticasPartidoModal
          isOpen={!!partidoStats}
          onClose={() => setPartidoStats(null)}
          partidoId={partidoStats._id || partidoStats.id || ''}
          partido={{
            _id: partidoStats._id || partidoStats.id || '',
            modoEstadisticas: (partidoStats as any).modoEstadisticas,
            modoVisualizacion: (partidoStats as any).modoVisualizacion,
          }}
        />
      )}
    </div>
  );
};

export default PartidoCalendar;

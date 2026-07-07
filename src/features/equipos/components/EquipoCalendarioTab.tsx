import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PartidoCard from '../../../shared/components/PartidoCard';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { EstadisticasPartidoModal } from '../../../shared/components/EstadisticasPartidoModal';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

interface EquipoCalendarioTabProps {
  equipoId: string;
}

type Vista = 'calendario' | 'lista';
type Escala = 'anual' | 'mensual' | 'semanal';

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

const rivalLabel = (p: Partido, equipoId: string): string => {
  const esLocal = String(p.equipoLocal?.id || (p.equipoLocal as any)?._id) === String(equipoId);
  const rival = esLocal ? p.equipoVisitante?.nombre : p.equipoLocal?.nombre;
  return esLocal ? `vs ${rival || 'Rival'}` : `@ ${rival || 'Rival'}`;
};

const MAX_CHIPS_MENSUAL = 2;
const MAX_CHIPS_SEMANAL = 3;

export const EquipoCalendarioTab: React.FC<EquipoCalendarioTabProps> = ({ equipoId }) => {
  const navigate = useNavigate();
  const [vista, setVista] = useState<Vista>('lista');
  const [escala, setEscala] = useState<Escala>('mensual');
  const [cursor, setCursor] = useState<Date>(todayUTC());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [modalListado, setModalListado] = useState<'proximos' | 'resultados' | null>(null);
  const [partidoStats, setPartidoStats] = useState<Partido | null>(null);

  const { data: partidos = [], isLoading } = useQuery({
    queryKey: ['equipo-calendario', equipoId],
    queryFn: () => PartidoService.getAll({ equipo: equipoId }),
    enabled: !!equipoId,
  });

  const proximos = useMemo(
    () =>
      partidos
        .filter((p) => p.estado === 'programado' || p.estado === 'en_juego')
        .sort((a, b) => fechaHoraValue(a) - fechaHoraValue(b)),
    [partidos]
  );

  const resultados = useMemo(
    () =>
      partidos
        .filter((p) => p.estado === 'finalizado')
        .sort((a, b) => fechaHoraValue(b) - fechaHoraValue(a)),
    [partidos]
  );

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

  const renderPartido = (p: Partido, variante: 'proximo' | 'resultado') => (
    <PartidoCard
      key={p.id || p._id}
      partido={p}
      variante={variante}
      onClick={() => navigate(`/partidos/${p.id || p._id}`)}
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

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando calendario…</p>;
  }

  if (proximos.length === 0 && resultados.length === 0) {
    return <EmptyState message="Este equipo todavía no tiene partidos programados ni jugados." />;
  }

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
        className={`flex flex-col items-stretch rounded-lg border p-1.5 text-left transition-colors ${
          opts.compact ? 'min-h-[52px]' : 'min-h-[88px]'
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
          <div className="mt-1 space-y-0.5">
            {visibles.map((p, i) => (
              <span key={p.id || p._id || i} className="flex items-center gap-1 truncate text-[10px] font-medium text-slate-600">
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${ESTADO_DOT[p.estado || 'programado']}`} />
                <span className="truncate">{rivalLabel(p, equipoId)}</span>
              </span>
            ))}
            {tieneOverflow && (
              <span className="block text-[10px] font-semibold text-brand-600">
                +{items.length - opts.maxChips} más
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setVista('lista')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              vista === 'lista' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setVista('calendario')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              vista === 'calendario' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Calendario
          </button>
        </div>

        {vista === 'calendario' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['semanal', 'mensual', 'anual'] as Escala[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEscala(e)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md capitalize transition-all ${
                    escala === e ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
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
        )}
      </div>

      {vista === 'lista' ? (
        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
                Próximos partidos
              </h2>
              {proximos.length > 3 && (
                <button onClick={() => setModalListado('proximos')} className="text-sm font-medium text-brand-600 hover:underline">
                  Ver todos ({proximos.length})
                </button>
              )}
            </div>
            {proximos.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No hay partidos programados por el momento.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {proximos.slice(0, 3).map((p) => renderPartido(p, 'proximo'))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-1 bg-indigo-600 rounded-full"></span>
                Resultados recientes
              </h2>
              {resultados.length > 3 && (
                <button onClick={() => setModalListado('resultados')} className="text-sm font-medium text-brand-600 hover:underline">
                  Ver todos ({resultados.length})
                </button>
              )}
            </div>
            {resultados.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Este equipo todavía no jugó partidos finalizados.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {resultados.slice(0, 3).map((p) => renderPartido(p, 'resultado'))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div>
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
          )}
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

      {modalListado && (
        <ModalBase
          onClose={() => setModalListado(null)}
          title={modalListado === 'proximos' ? 'Todos los próximos partidos' : 'Todos los resultados'}
          size="lg"
        >
          <div className="p-4 grid gap-4 sm:grid-cols-2">
            {(modalListado === 'proximos' ? proximos : resultados).map((p) =>
              renderPartido(p, modalListado === 'proximos' ? 'proximo' : 'resultado')
            )}
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

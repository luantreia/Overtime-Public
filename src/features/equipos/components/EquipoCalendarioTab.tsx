import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PartidoCard from '../../../shared/components/PartidoCard';
import { PartidoCalendar } from '../../../shared/components/PartidoCalendar';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { EstadisticasPartidoModal } from '../../../shared/components/EstadisticasPartidoModal';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

interface EquipoCalendarioTabProps {
  equipoId: string;
}

type Vista = 'calendario' | 'lista';

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

export const EquipoCalendarioTab: React.FC<EquipoCalendarioTabProps> = ({ equipoId }) => {
  const navigate = useNavigate();
  const [vista, setVista] = useState<Vista>('lista');
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
        <PartidoCalendar partidos={partidos} labelFn={(p) => rivalLabel(p, equipoId)} />
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

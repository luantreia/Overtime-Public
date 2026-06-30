import React, { useMemo, useState } from 'react';
import { type Temporada } from '../services/temporadaService';
import { type Fase } from '../services/faseService';
import { type Partido } from '../../partidos/services/partidoService';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';
import { Bracket } from '../../../shared/components/Bracket/Bracket';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';

type EstadoFiltro = '' | 'proximamente' | 'en_curso' | 'finalizado';

interface CompetenciaResultadosTabProps {
  temporadas: Temporada[];
  selectedTemporada: string;
  onTemporadaChange: (id: string) => void;
  fases: Fase[];
  selectedFase: string;
  onFaseChange: (id: string) => void;
  loading: boolean;
  faseDetails: Fase | null;
  fasePartidos: Partido[];
  onPartidoClick: (id: string) => void;
}

const ESTADO_LABELS: Record<EstadoFiltro, string> = {
  '': 'Todos',
  proximamente: 'Próximos',
  en_curso: 'En curso',
  finalizado: 'Finalizados',
};

export const CompetenciaResultadosTab: React.FC<CompetenciaResultadosTabProps> = ({
  temporadas,
  selectedTemporada,
  onTemporadaChange,
  fases,
  selectedFase,
  onFaseChange,
  loading,
  faseDetails,
  fasePartidos,
  onPartidoClick,
}) => {
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>('');

  const noTemporadas = temporadas.length === 0;

  // Only used when faseDetails is a plain-partidos view (not grupo/liga/playoff)
  const filteredPartidos = useMemo(() => {
    if (!selectedEstado) return fasePartidos;
    return fasePartidos.filter(p => p.estado === selectedEstado);
  }, [fasePartidos, selectedEstado]);

  const isListView = faseDetails && faseDetails.tipo !== 'grupo' && faseDetails.tipo !== 'liga' && faseDetails.tipo !== 'playoff';

  return (
    <div className="p-6">
      {/* Selectors */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <label htmlFor="temporada" className="block text-xs font-medium text-slate-500 mb-1">Temporada</label>
          <select
            id="temporada"
            value={selectedTemporada}
            onChange={(e) => onTemporadaChange(e.target.value)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            disabled={noTemporadas}
          >
            {noTemporadas
              ? <option value="">Sin temporadas</option>
              : temporadas.map((t) => (
                  <option key={t._id} value={t._id}>{t.nombre}</option>
                ))
            }
          </select>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[160px]">
          <label htmlFor="fase" className="block text-xs font-medium text-slate-500 mb-1">Fase</label>
          <select
            id="fase"
            value={selectedFase}
            onChange={(e) => onFaseChange(e.target.value)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            disabled={!selectedTemporada || fases.length === 0}
          >
            <option value="">{fases.length === 0 ? 'Sin fases' : 'Seleccionar fase'}</option>
            {fases.map((f) => (
              <option key={f._id} value={f._id}>{f.nombre}</option>
            ))}
          </select>
        </div>

        {/* Estado filter — only relevant for plain-partidos view */}
        {isListView && (
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <label htmlFor="estado-resultados" className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
            <select
              id="estado-resultados"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value as EstadoFiltro)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            >
              {(Object.keys(ESTADO_LABELS) as EstadoFiltro[]).map(k => (
                <option key={k} value={k}>{ESTADO_LABELS[k]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando resultados...</p>
        </div>
      ) : noTemporadas ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">Esta competencia no tiene temporadas registradas.</p>
        </div>
      ) : !selectedFase ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">
            {fases.length === 0 && selectedTemporada
              ? 'La temporada seleccionada no tiene fases registradas.'
              : 'Seleccioná una fase para ver los resultados.'}
          </p>
        </div>
      ) : (
        <div>
          {faseDetails?.tipo === 'grupo' || faseDetails?.tipo === 'liga' ? (
            <TablaPosiciones faseId={selectedFase} />
          ) : faseDetails?.tipo === 'playoff' ? (
            <Bracket matches={fasePartidos} />
          ) : (
            <>
              {filteredPartidos.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500">
                    {selectedEstado
                      ? 'No hay partidos que coincidan con ese estado.'
                      : 'No hay partidos registrados en esta fase.'}
                  </p>
                  {selectedEstado && (
                    <button
                      onClick={() => setSelectedEstado('')}
                      className="mt-2 text-sm text-brand-600 hover:underline"
                    >
                      Limpiar filtro
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400 mb-3">{filteredPartidos.length} partido{filteredPartidos.length !== 1 ? 's' : ''}</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPartidos.map((partido) => (
                      <PartidoCard
                        key={partido.id}
                        partido={partido}
                        onClick={() => onPartidoClick(partido.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

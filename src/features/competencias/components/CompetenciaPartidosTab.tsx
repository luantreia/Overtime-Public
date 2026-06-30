import React, { useMemo, useState } from 'react';
import { type Temporada } from '../services/temporadaService';
import { type Fase } from '../services/faseService';
import { type Partido } from '../../partidos/services/partidoService';
import { type JugadorCompetencia } from '../services/jugadorCompetenciaService';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';

type EstadoFiltro = '' | 'proximamente' | 'en_curso' | 'finalizado';

interface CompetenciaPartidosTabProps {
  temporadas: Temporada[];
  selectedTemporada: string;
  onTemporadaChange: (id: string) => void;
  fases: Fase[];
  selectedFase: string;
  onFaseChange: (id: string) => void;
  loading: boolean;
  partidos: Partido[];
  onPartidoClick: (id: string) => void;
  isRanked: boolean;
  jugadoresComp: JugadorCompetencia[];
  selectedJugador: string;
  onJugadorChange: (id: string) => void;
}

const ESTADO_LABELS: Record<EstadoFiltro, string> = {
  '': 'Todos',
  proximamente: 'Próximos',
  en_curso: 'En curso',
  finalizado: 'Finalizados',
};

export const CompetenciaPartidosTab: React.FC<CompetenciaPartidosTabProps> = ({
  temporadas,
  selectedTemporada,
  onTemporadaChange,
  fases,
  selectedFase,
  onFaseChange,
  loading,
  partidos,
  onPartidoClick,
  isRanked,
  jugadoresComp,
  selectedJugador,
  onJugadorChange,
}) => {
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>('');

  // Build unique team list from loaded partidos (not ranked only)
  const equiposDisponibles = useMemo(() => {
    if (isRanked) return [];
    const map = new Map<string, string>();
    for (const p of partidos) {
      const local = p.equipoLocal as any;
      const visita = p.equipoVisitante as any;
      if (local?.id || local?._id) map.set(local.id ?? local._id, local.nombre ?? '');
      if (visita?.id || visita?._id) map.set(visita.id ?? visita._id, visita.nombre ?? '');
    }
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [partidos, isRanked]);

  // Jugadores list for ranked filter
  const jugadoresDisponibles = useMemo(() => {
    if (!isRanked) return [];
    return jugadoresComp
      .map(jc => {
        const jug = jc.jugador as any;
        const id = typeof jug === 'string' ? jug : jug?._id;
        const nombre = typeof jug === 'object' ? jug?.nombre : undefined;
        return id && nombre ? { id, nombre } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.nombre.localeCompare(b!.nombre)) as { id: string; nombre: string }[];
  }, [jugadoresComp, isRanked]);

  // Client-side filters (estado + equipo; jugador is server-side via selectedJugador prop)
  const filteredPartidos = useMemo(() => {
    let result = partidos;
    if (selectedEstado) {
      result = result.filter(p => p.estado === selectedEstado);
    }
    if (!isRanked && selectedEquipo) {
      result = result.filter(p => {
        const local = p.equipoLocal as any;
        const visita = p.equipoVisitante as any;
        return (local?.id ?? local?._id) === selectedEquipo || (visita?.id ?? visita?._id) === selectedEquipo;
      });
    }
    return result;
  }, [partidos, selectedEstado, selectedEquipo, isRanked]);

  const noTemporadas = temporadas.length === 0;
  const noSelection = !selectedFase && !selectedTemporada;

  return (
    <div className="p-6">
      {/* Selectors row */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <label htmlFor="temporada-partidos" className="block text-xs font-medium text-slate-500 mb-1">Temporada</label>
          <select
            id="temporada-partidos"
            value={selectedTemporada}
            onChange={(e) => {
              onTemporadaChange(e.target.value);
              setSelectedEquipo('');
            }}
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
          <label htmlFor="fase-partidos" className="block text-xs font-medium text-slate-500 mb-1">Fase</label>
          <select
            id="fase-partidos"
            value={selectedFase}
            onChange={(e) => onFaseChange(e.target.value)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            disabled={!selectedTemporada || fases.length === 0}
          >
            <option value="">Todas las fases</option>
            {fases.map((f) => (
              <option key={f._id} value={f._id}>{f.nombre}</option>
            ))}
          </select>
        </div>

        {/* Estado filter */}
        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <label htmlFor="estado-partidos" className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
          <select
            id="estado-partidos"
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value as EstadoFiltro)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
          >
            {(Object.keys(ESTADO_LABELS) as EstadoFiltro[]).map(k => (
              <option key={k} value={k}>{ESTADO_LABELS[k]}</option>
            ))}
          </select>
        </div>

        {/* Equipo filter (not ranked) */}
        {!isRanked && equiposDisponibles.length > 0 && (
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <label htmlFor="equipo-partidos" className="block text-xs font-medium text-slate-500 mb-1">Equipo</label>
            <select
              id="equipo-partidos"
              value={selectedEquipo}
              onChange={(e) => setSelectedEquipo(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            >
              <option value="">Todos los equipos</option>
              {equiposDisponibles.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Jugador filter (ranked) */}
        {isRanked && jugadoresDisponibles.length > 0 && (
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <label htmlFor="jugador-partidos" className="block text-xs font-medium text-slate-500 mb-1">Jugador</label>
            <select
              id="jugador-partidos"
              value={selectedJugador}
              onChange={(e) => onJugadorChange(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            >
              <option value="">Todos los jugadores</option>
              {jugadoresDisponibles.map(j => (
                <option key={j.id} value={j.id}>{j.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active filters summary */}
      {(selectedEstado || selectedEquipo || selectedJugador) && !loading && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedEstado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-0.5 text-xs font-medium text-brand-700">
              {ESTADO_LABELS[selectedEstado]}
              <button onClick={() => setSelectedEstado('')} className="ml-1 text-brand-400 hover:text-brand-700">×</button>
            </span>
          )}
          {selectedEquipo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-0.5 text-xs font-medium text-brand-700">
              {equiposDisponibles.find(e => e.id === selectedEquipo)?.nombre ?? 'Equipo'}
              <button onClick={() => setSelectedEquipo('')} className="ml-1 text-brand-400 hover:text-brand-700">×</button>
            </span>
          )}
          {selectedJugador && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-0.5 text-xs font-medium text-brand-700">
              {jugadoresDisponibles.find(j => j.id === selectedJugador)?.nombre ?? 'Jugador'}
              <button onClick={() => onJugadorChange('')} className="ml-1 text-brand-400 hover:text-brand-700">×</button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando partidos...</p>
        </div>
      ) : noTemporadas ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">Esta competencia no tiene temporadas registradas.</p>
        </div>
      ) : noSelection ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">Seleccioná una temporada para ver los partidos.</p>
        </div>
      ) : filteredPartidos.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">
            {selectedEstado || selectedEquipo || selectedJugador
              ? 'No hay partidos que coincidan con los filtros seleccionados.'
              : 'No hay partidos registrados para esta selección.'}
          </p>
          {(selectedEstado || selectedEquipo || selectedJugador) && (
            <button
              onClick={() => { setSelectedEstado(''); setSelectedEquipo(''); onJugadorChange(''); }}
              className="mt-2 text-sm text-brand-600 hover:underline"
            >
              Limpiar filtros
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
    </div>
  );
};

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { EstadisticasPartidoModal } from '../../../shared/components/EstadisticasPartidoModal';
import PartidoCard from '../../../shared/components/PartidoCard';
import { useEntity } from '../../../shared/hooks';
import { PartidoService, Partido } from '../services/partidoService';
import { CompetenciaService, Competencia } from '../../competencias/services/competenciaService';
import { TemporadaService, Temporada } from '../../competencias/services/temporadaService';
import { FaseService, Fase } from '../../competencias/services/faseService';
import { EquipoService, Equipo } from '../../equipos/services/equipoService';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';

const Partidos: React.FC = () => {
  // Filtros
  const [competenciaId, setCompetenciaId] = useState('');
  const [temporadaId, setTemporadaId] = useState('');
  const [faseId, setFaseId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [estado, setEstado] = useState('');
  const [esAmistoso, setEsAmistoso] = useState(false);

  // Listas para selects
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  // Cargar competencias y equipos al inicio
  useEffect(() => {
    CompetenciaService.getAll().then(setCompetencias).catch(console.error);
    EquipoService.getAll().then(setEquipos).catch(console.error);
  }, []);

  // Cargar temporadas cuando cambia competencia
  useEffect(() => {
    if (!competenciaId) {
      setTemporadas([]);
      setTemporadaId('');
      return;
    }
    TemporadaService.getByCompetencia(competenciaId).then(setTemporadas).catch(console.error);
  }, [competenciaId]);

  // Cargar fases cuando cambia temporada
  useEffect(() => {
    if (!temporadaId) {
      setFases([]);
      setFaseId('');
      return;
    }
    FaseService.getByTemporada(temporadaId).then(setFases).catch(console.error);
  }, [temporadaId]);

  const fetchPartidos = useCallback(() => {
    const filters: any = {};
    if (competenciaId) filters.competencia = competenciaId;
    if (temporadaId) filters.temporada = temporadaId;
    if (faseId) filters.fase = faseId;
    if (equipoId) filters.equipo = equipoId;
    if (fecha) filters.fecha = fecha;
    if (estado) filters.estado = estado;
    if (esAmistoso) filters.tipo = 'amistoso';

    return PartidoService.getAll(filters);
  }, [competenciaId, temporadaId, faseId, equipoId, fecha, estado, esAmistoso]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const fetchPartidosPaginated = useCallback(() => {
    return PartidoService.getPaginated({ page, limit, filters: {
      competencia: competenciaId || undefined,
      temporada: temporadaId || undefined,
      fase: faseId || undefined,
      equipo: equipoId || undefined,
      fecha: fecha || undefined,
      estado: estado || undefined,
      tipo: esAmistoso ? 'amistoso' : undefined,
    }});
  }, [page, limit, competenciaId, temporadaId, faseId, equipoId, fecha, estado, esAmistoso]);

  const { data: paged, loading, error, refetch } = useEntity<{ items: Partido[]; page: number; limit: number; total: number } | Partido[]>(fetchPartidosPaginated);
  const partidos = useMemo(() => {
    if (!paged) return [];
    if (Array.isArray(paged)) {
      const start = (page - 1) * limit;
      return paged.slice(start, start + limit);
    }
    return paged.items ?? [];
  }, [paged, page, limit]);
  const total = useMemo(() => {
    if (!paged) return 0;
    if (Array.isArray(paged)) return paged.length;
    return paged.total ?? partidos.length;
  }, [paged, partidos.length]);
  const totalPages = useMemo(() => (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1), [total, limit]);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const handleShowStats = (partido: Partido) => {
    setSelectedPartido(partido);
    setShowStatsModal(true);
  };

  const handleCloseStats = () => {
    setShowStatsModal(false);
    setSelectedPartido(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Partidos</h1>
          <p className="mt-2 text-slate-600">Calendario de partidos y resultados</p>
        </div>

        {/* Filtros */}
        <div className="mb-8 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <select
              value={competenciaId}
              onChange={(e) => setCompetenciaId(e.target.value)}
              className="rounded-lg border-slate-300 text-sm"
            >
              <option value="">Todas las competencias</option>
              {competencias.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>{c.nombre}</option>
              ))}
            </select>

            <select
              value={temporadaId}
              onChange={(e) => setTemporadaId(e.target.value)}
              disabled={!competenciaId}
              className="rounded-lg border-slate-300 text-sm disabled:bg-slate-100"
            >
              <option value="">Todas las temporadas</option>
              {temporadas.map((t) => (
                <option key={t._id} value={t._id}>{t.nombre}</option>
              ))}
            </select>

            <select
              value={faseId}
              onChange={(e) => setFaseId(e.target.value)}
              disabled={!temporadaId}
              className="rounded-lg border-slate-300 text-sm disabled:bg-slate-100"
            >
              <option value="">Todas las fases</option>
              {fases.map((f) => (
                <option key={f._id} value={f._id}>{f.nombre}</option>
              ))}
            </select>

            <select
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
              className="rounded-lg border-slate-300 text-sm"
            >
              <option value="">Todos los equipos</option>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="rounded-lg border-slate-300 text-sm"
            />

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="rounded-lg border-slate-300 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="programado">Programado</option>
              <option value="en_juego">En Juego</option>
              <option value="finalizado">Finalizado</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={esAmistoso}
                onChange={(e) => setEsAmistoso(e.target.checked)}
                className="rounded border-slate-300"
              />
              Solo Amistosos
            </label>
          </div>
        </div>

        {/* Tabla de Posiciones (si hay fase seleccionada) */}
        {faseId && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Tabla de Posiciones</h2>
            <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 overflow-x-auto">
              <TablaPosiciones faseId={faseId} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto"></div>
              <p className="text-slate-600">Cargando partidos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error al cargar partidos: {error}</p>
              <button
                onClick={refetch}
                className="rounded-lg bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : partidos && partidos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partidos.map((partido) => (
              <PartidoCard
                key={partido._id || partido.id}
                partido={partido}
                variante={partido.estado === 'finalizado' ? 'resultado' : 'proximo'}
                actions={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowStats(partido);
                    }}
                    className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                  >
                    📊 Stats
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay partidos disponibles con estos filtros</p>
          </div>
        )}

        {/* Pagination controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Mostrar</span>
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }}
              className="rounded-lg border border-slate-300 text-sm px-2 py-1"
            >
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={36}>36</option>
              <option value={44}>44</option>
            </select>
            <span className="text-sm text-slate-600">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-700">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {selectedPartido && (
        <EstadisticasPartidoModal
          isOpen={showStatsModal}
          onClose={handleCloseStats}
          partidoId={selectedPartido._id || selectedPartido.id || ''}
          partido={{
            _id: selectedPartido._id || selectedPartido.id || '',
            modoEstadisticas: selectedPartido.modoEstadisticas,
            modoVisualizacion: selectedPartido.modoVisualizacion,
          }}
        />
      )}
    </div>
  );
};

export default Partidos;

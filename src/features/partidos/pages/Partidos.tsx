import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { EstadisticasPartidoModal } from '../../../shared/components/EstadisticasPartidoModal';
import PartidoCard from '../../../shared/components/PartidoCard';
import { PartidoCalendar } from '../../../shared/components/PartidoCalendar';
import { FilterCombobox } from '../../../shared/components/FilterCombobox';
import { MultiCheckDropdown } from '../../../shared/components/MultiCheckDropdown';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { PartidoService, Partido } from '../services/partidoService';
import { CompetenciaService, Competencia } from '../../competencias/services/competenciaService';
import { TemporadaService, Temporada } from '../../competencias/services/temporadaService';
import { FaseService, Fase } from '../../competencias/services/faseService';
import { EquipoService, Equipo } from '../../equipos/services/equipoService';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';

type Vista = 'lista' | 'calendario';
type TipoFiltro = 'todos' | 'amistoso' | 'competencia';

const ESTADO_OPTIONS = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_juego', label: 'En Juego' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const TIPO_LABELS: Record<TipoFiltro, string> = {
  todos: 'Todos',
  amistoso: 'Amistosos',
  competencia: 'Competencia',
};

const Partidos: React.FC = () => {
  usePageTitle('Partidos');
  const navigate = useNavigate();
  const [vista, setVista] = useState<Vista>('lista');
  // Filtros
  const [organizacionId, setOrganizacionId] = useState('');
  const [competenciaId, setCompetenciaId] = useState('');
  const [temporadaId, setTemporadaId] = useState('');
  const [faseId, setFaseId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [estados, setEstados] = useState<string[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todos');

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

  // Competencias que pertenecen a la organización elegida (la organización no es un campo directo
  // del partido, así que se traduce a "cualquiera de estas competencias" para el backend)
  const organizacionCompetenciaIds = useMemo(() => {
    if (!organizacionId) return [];
    return competencias
      .filter((c) => (c.organizacion?._id || c.organizacion?.id) === organizacionId)
      .map((c) => c.id || c._id)
      .filter((id): id is string => Boolean(id));
  }, [competencias, organizacionId]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const fetchPartidosPaginated = useCallback(() => {
    return PartidoService.getPaginated({ page, limit, filters: {
      competencia: competenciaId || (organizacionCompetenciaIds.length ? organizacionCompetenciaIds : undefined),
      temporada: temporadaId || undefined,
      fase: faseId || undefined,
      equipo: equipoId || undefined,
      estado: estados.length ? estados : undefined,
      tipo: tipoFiltro === 'todos' ? undefined : tipoFiltro,
    }});
  }, [page, limit, competenciaId, organizacionCompetenciaIds, temporadaId, faseId, equipoId, estados, tipoFiltro]);

  const { data: paged, isLoading: loading, error: partidosQueryError, refetch } = useQuery<{ items: Partido[]; page: number; limit: number; total: number } | Partido[]>({
    queryKey: ['partidos-list', page, limit, competenciaId, organizacionId, temporadaId, faseId, equipoId, estados, tipoFiltro],
    queryFn: fetchPartidosPaginated,
  });
  const error = partidosQueryError instanceof Error ? partidosQueryError.message : partidosQueryError ? String(partidosQueryError) : null;
  const partidos = useMemo(() => {
    if (!paged) return [];
    let items: Partido[] = [];
    if (Array.isArray(paged)) {
      const start = (page - 1) * limit;
      items = paged.slice(start, start + limit);
    } else {
      items = paged.items ?? [];
    }
    
    return items;
  }, [paged, page, limit]);
  const total = useMemo(() => {
    if (!paged) return 0;
    if (Array.isArray(paged)) return paged.length;
    return paged.total ?? partidos.length;
  }, [paged, partidos.length]);
  const totalPages = useMemo(() => (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1), [total, limit]);

  const { data: partidosCalendario = [], isLoading: loadingCalendario } = useQuery({
    queryKey: ['partidos-calendario', competenciaId, organizacionId, temporadaId, faseId, equipoId, estados, tipoFiltro],
    queryFn: () => PartidoService.getAll({
      competencia: competenciaId || (organizacionCompetenciaIds.length ? organizacionCompetenciaIds : undefined),
      temporada: temporadaId || undefined,
      fase: faseId || undefined,
      equipo: equipoId || undefined,
      estado: estados.length ? estados : undefined,
      tipo: tipoFiltro === 'todos' ? undefined : tipoFiltro,
    }),
    enabled: vista === 'calendario',
  });
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

  const equipoItems = useMemo(
    () => equipos.map((e) => ({ id: e.id || e._id || '', label: e.nombre })),
    [equipos]
  );
  const organizacionItems = useMemo(() => {
    const map = new Map<string, string>();
    competencias.forEach((c) => {
      const id = c.organizacion?._id || c.organizacion?.id;
      if (id && c.organizacion?.nombre) map.set(id, c.organizacion.nombre);
    });
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [competencias]);
  const competenciaItems = useMemo(() => {
    const items = organizacionId
      ? competencias.filter((c) => (c.organizacion?._id || c.organizacion?.id) === organizacionId)
      : competencias;
    return items.map((c) => ({ id: c.id || c._id || '', label: c.nombre }));
  }, [competencias, organizacionId]);

  const limpiarFiltros = () => {
    setOrganizacionId('');
    setCompetenciaId('');
    setEquipoId('');
    setEstados([]);
    setTipoFiltro('todos');
    setPage(1);
  };

  const chips = useMemo(() => {
    const items: { key: string; label: string; onRemove: () => void }[] = [];
    if (equipoId) {
      const nombre = equipos.find((e) => (e.id || e._id) === equipoId)?.nombre;
      items.push({ key: 'equipo', label: `Equipo: ${nombre || equipoId}`, onRemove: () => setEquipoId('') });
    }
    if (organizacionId) {
      const nombre = organizacionItems.find((o) => o.id === organizacionId)?.label;
      items.push({ key: 'organizacion', label: `Organización: ${nombre || organizacionId}`, onRemove: () => setOrganizacionId('') });
    }
    if (competenciaId) {
      const nombre = competencias.find((c) => (c.id || c._id) === competenciaId)?.nombre;
      items.push({ key: 'competencia', label: `Competencia: ${nombre || competenciaId}`, onRemove: () => setCompetenciaId('') });
    }
    if (temporadaId) {
      const nombre = temporadas.find((t) => t._id === temporadaId)?.nombre;
      items.push({ key: 'temporada', label: `Temporada: ${nombre || temporadaId}`, onRemove: () => setTemporadaId('') });
    }
    if (faseId) {
      const nombre = fases.find((f) => f._id === faseId)?.nombre;
      items.push({ key: 'fase', label: `Fase: ${nombre || faseId}`, onRemove: () => setFaseId('') });
    }
    estados.forEach((val) => {
      const label = ESTADO_OPTIONS.find((o) => o.value === val)?.label || val;
      items.push({ key: `estado-${val}`, label, onRemove: () => setEstados((prev) => prev.filter((v) => v !== val)) });
    });
    if (tipoFiltro !== 'todos') {
      items.push({ key: 'tipo', label: TIPO_LABELS[tipoFiltro], onRemove: () => setTipoFiltro('todos') });
    }
    return items;
  }, [equipoId, organizacionId, competenciaId, temporadaId, faseId, estados, tipoFiltro, equipos, organizacionItems, competencias, temporadas, fases]);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Partidos</h1>
            <p className="mt-2 text-slate-600">Calendario de partidos y resultados</p>
          </div>
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

        {/* Filtros */}
        <div className="mb-8">
          <Popover className="relative inline-block">
            <PopoverButton className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              <FunnelIcon className="h-4 w-4 text-slate-500" />
              Filtros
              {chips.length > 0 && (
                <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">{chips.length}</span>
              )}
            </PopoverButton>
            <PopoverPanel
              anchor="bottom start"
              transition
              className="z-20 mt-2 w-80 sm:w-96 space-y-4 rounded-xl bg-white p-4 shadow-lg border border-slate-200"
            >
              <FilterCombobox
                items={equipoItems}
                value={equipoId}
                onChange={setEquipoId}
                label="Equipo"
                placeholder="Buscar equipo..."
              />

              <div className="flex gap-3">
                <div className="flex-1">
                  <MultiCheckDropdown
                    options={ESTADO_OPTIONS}
                    selected={estados}
                    onChange={setEstados}
                    label="Estado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['todos', 'amistoso', 'competencia'] as TipoFiltro[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipoFiltro(t)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                          tipoFiltro === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {TIPO_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <FilterCombobox
                items={organizacionItems}
                value={organizacionId}
                onChange={(id) => {
                  setOrganizacionId(id);
                  setCompetenciaId('');
                }}
                label="Organización"
                placeholder="Buscar organización..."
              />

              <FilterCombobox
                items={competenciaItems}
                value={competenciaId}
                onChange={setCompetenciaId}
                label="Competencia"
                placeholder="Buscar competencia..."
              />

              {competenciaId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
                  <select
                    value={temporadaId}
                    onChange={(e) => setTemporadaId(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                  >
                    <option value="">Todas las temporadas</option>
                    {temporadas.map((t) => (
                      <option key={t._id || Math.random()} value={t._id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {temporadaId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fase</label>
                  <select
                    value={faseId}
                    onChange={(e) => setFaseId(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                  >
                    <option value="">Todas las fases</option>
                    {fases.map((f) => (
                      <option key={f._id || Math.random()} value={f._id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {chips.length > 0 && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </PopoverPanel>
          </Popover>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-0.5 text-xs font-medium text-brand-700"
                >
                  {chip.label}
                  <button onClick={chip.onRemove} className="ml-1 text-brand-400 hover:text-brand-700">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
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

        {vista === 'calendario' ? (
          loadingCalendario ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto"></div>
                <p className="text-slate-600">Cargando partidos...</p>
              </div>
            </div>
          ) : (
            <PartidoCalendar partidos={partidosCalendario} />
          )
        ) : (
          <>
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
                    onClick={() => void refetch()}
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
                    onClick={() => navigate(`/partidos/${partido._id || partido.id}`)}
                    actions={
                      partido.sets && partido.sets.length > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowStats(partido);
                          }}
                          className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                        >
                          📊 Stats
                        </button>
                      ) : null
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
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
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
          </>
        )}
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

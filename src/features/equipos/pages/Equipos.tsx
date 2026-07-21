import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EquipoCard, FilterBar } from '../../../shared/components';
import { EquipoService, type Equipo } from '../services/equipoService';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const Equipos: React.FC = () => {
  usePageTitle('Equipos');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const activeFiltersCount = countryFilter ? 1 : 0;

  const { data: paged, isLoading: loading, error: equiposQueryError, refetch } = useQuery<Equipo[]>({
    queryKey: ['equipos'],
    queryFn: () => EquipoService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutos: directorio público que cambia seguido, no ameritan las 24hs por defecto
  });
  const error = equiposQueryError instanceof Error ? equiposQueryError.message : equiposQueryError ? String(equiposQueryError) : null;

  // Extraer países únicos de los datos para el filtro
  const countries = useMemo(() => {
    if (!paged || !Array.isArray(paged)) return [];
    const unique = new Set(paged.map(e => e.pais).filter(Boolean));
    return Array.from(unique).sort();
  }, [paged]);

  const filteredItems = useMemo(() => {
    if (!paged) return [];
    let items = [...paged];

    // Aplicar búsqueda por nombre
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      items = items.filter(e => 
        e.nombre.toLowerCase().includes(lowSearch)
      );
    }

    // Aplicar filtro de país
    if (countryFilter) {
      items = items.filter(e => e.pais === countryFilter);
    }

    return items;
  }, [paged, searchTerm, countryFilter]);

  const equipos = useMemo(() => {
    const items = [...filteredItems];
    
    // Función para calcular qué tan "completo" está el perfil del equipo
    const getCompletenessScore = (e: Equipo) => {
      let score = 0;
      if (e.escudo || e.imagen) score += 10;
      if (e.ciudad) score += 5;
      if (e.pais) score += 5;
      if (e.organizacionId || e.organizacion) score += 5;
      if (e.miembros && e.miembros > 0) score += 3;
      if (e.activo) score += 2;
      
      // Priorizar también por datos relacionales si vienen
      if (e.jugadoresCount) score += e.jugadoresCount * 2;
      if (e.partidosCount) score += e.partidosCount * 2;
      
      return score;
    };

    // Ordenamos: más completos primero
    items.sort((a, b) => getCompletenessScore(b) - getCompletenessScore(a));

    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [filteredItems, page, limit]);

  const total = filteredItems.length;
  const totalPages = useMemo(() => (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1), [total, limit]);
  const totalSinFiltrar = paged?.length ?? 0;
  const hayFiltrosActivos = Boolean(searchTerm || countryFilter);

  const equiposChips = useMemo(() => {
    const items: { key: string; label: string; onRemove: () => void }[] = [];
    if (countryFilter) {
      items.push({ key: 'pais', label: `País: ${countryFilter}`, onRemove: () => { setCountryFilter(''); setPage(1); } });
    }
    return items;
  }, [countryFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando equipos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar equipos: {error}</p>
          <button
            onClick={() => void refetch()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-3 pb-8 sm:pt-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Búsqueda + filtros colapsables */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); setPage(1); }}
          searchPlaceholder="Buscar por nombre..."
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(v => !v)}
          activeFiltersCount={activeFiltersCount}
          chips={equiposChips}
        >
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            <div>
              <label htmlFor="country" className="block text-xs font-medium text-slate-500 mb-1">País / Región</label>
              <select
                id="country"
                value={countryFilter}
                onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
              >
                <option value="">Todos</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end col-span-2 sm:col-span-1">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCountryFilter('');
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </FilterBar>

        <p className="mb-4 text-sm text-slate-500">
          {hayFiltrosActivos
            ? `Mostrando ${total} equipo${total !== 1 ? 's' : ''} que coincide${total !== 1 ? 'n' : ''} (de ${totalSinFiltrar} en total)`
            : `Mostrando ${totalSinFiltrar} equipo${totalSinFiltrar !== 1 ? 's' : ''} en total`}
        </p>

        {!equipos || equipos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay equipos que coincidan con la búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {equipos.map((equipo) => {
              const equipoId = equipo._id || equipo.id;
              return (
                <EquipoCard
                  key={equipoId}
                  equipo={equipo}
                  actions={
                    <button
                      onClick={() => navigate(`/equipos/${equipoId}`)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 transition-colors"
                    >
                      Ver detalles
                    </button>
                  }
                />
              );
            })}
          </div>
        )}

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
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-700">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Equipos;

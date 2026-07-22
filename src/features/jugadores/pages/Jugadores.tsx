
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { JugadorCard, FilterBar, JoinCTA } from '../../../shared/components';
import { JugadorService, type Jugador } from '../services/jugadorService';
import { EquipoService } from '../../equipos/services/equipoService';
import { useAuth } from '../../../app/providers/AuthContext';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const Jugadores: React.FC = () => {
  usePageTitle('Jugadores');
  const navigate = useNavigate();
  const { user } = useAuth();
  // El límite ahora es cuántos mostramos inicialmente y por "batch"
  const [displayLimit, setDisplayLimit] = useState(24);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const activeFiltersCount = (genderFilter ? 1 : 0) + (nationalityFilter ? 1 : 0) + (teamFilter ? 1 : 0);

  // Semilla diaria para rotación de perfiles (cambia cada 24h)
  const discoverySeed = useMemo(() => {
    const now = new Date();
    return now.getFullYear() + (now.getMonth() * 31) + now.getDate();
  }, []);

  const { data: paged, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['jugadores-list'],
    queryFn: () => JugadorService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache fresca
  });

  // Extraer nacionalidades únicas
  const nationalities = useMemo(() => {
    const items = Array.isArray(paged) ? paged : (paged as any)?.items || [];
    const unique = new Set(items.map((j: any) => j.nacionalidad).filter(Boolean));
    return Array.from(unique).sort() as string[];
  }, [paged]);

  const { data: equipos = [] } = useQuery({
    queryKey: ['equipos-list-filtro'],
    queryFn: () => EquipoService.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const equiposOrdenados = useMemo(
    () => [...equipos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [equipos]
  );

  const { data: teamJugadorIds } = useQuery({
    queryKey: ['jugador-equipo-roster', teamFilter],
    queryFn: () => JugadorService.getIdsByEquipo(teamFilter),
    enabled: !!teamFilter,
    staleTime: 1000 * 60 * 5,
  });

  const filteredAndSortedItems = useMemo(() => {
    const rawItems = Array.isArray(paged) ? paged : (paged as any)?.items || [];
    let items = [...rawItems];

    // 1. Aplicar búsqueda
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      items = items.filter(j => 
        j.nombre.toLowerCase().includes(lowSearch) || 
        j.alias?.toLowerCase().includes(lowSearch)
      );
    }

    // 2. Aplicar filtros
    if (genderFilter) items = items.filter(j => j.genero === genderFilter);
    if (nationalityFilter) items = items.filter(j => j.nacionalidad === nationalityFilter);
    if (teamFilter) {
      const idsEquipo = new Set(teamJugadorIds || []);
      items = items.filter(j => idsEquipo.has((j._id || j.id) as string));
    }

    // 3. Orden: rotación diaria (mezcla estable durante 24hs, cambia al día siguiente)
    const getDailyNoise = (j: Jugador, seed: number) => {
      const playerIdStr = (j._id || j.id || '0').toString();
      const idHash = playerIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (idHash + seed) % 15;
    };

    items.sort((a, b) => getDailyNoise(b, discoverySeed) - getDailyNoise(a, discoverySeed));
    
    return items;
  }, [paged, searchTerm, genderFilter, nationalityFilter, teamFilter, teamJugadorIds, discoverySeed]);

  // Jugadores a mostrar actualmente (el "slide" del infinite scroll)
  const jugadoresVisible = useMemo(() => {
    return filteredAndSortedItems.slice(0, displayLimit);
  }, [filteredAndSortedItems, displayLimit]);

  const hasMore = displayLimit < filteredAndSortedItems.length;

  const GENERO_LABELS: Record<string, string> = {
    masculino: 'Masculino',
    femenino: 'Femenino',
    otro: 'Otro',
  };

  const jugadoresChips = useMemo(() => {
    const items: { key: string; label: string; onRemove: () => void }[] = [];
    if (genderFilter) {
      items.push({ key: 'genero', label: `Género: ${GENERO_LABELS[genderFilter] || genderFilter}`, onRemove: () => setGenderFilter('') });
    }
    if (nationalityFilter) {
      items.push({ key: 'nacionalidad', label: `Nacionalidad: ${nationalityFilter}`, onRemove: () => setNationalityFilter('') });
    }
    if (teamFilter) {
      const nombreEquipo = equipos.find(e => (e._id || e.id) === teamFilter)?.nombre || teamFilter;
      items.push({ key: 'equipo', label: `Equipo: ${nombreEquipo}`, onRemove: () => setTeamFilter('') });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderFilter, nationalityFilter, teamFilter, equipos]);

  // Intersection Observer para disparar la carga de más elementos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayLimit((prev) => prev + 24);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore]);

  // Resetear el scroll cuando cambian los filtros
  useEffect(() => {
    setDisplayLimit(24);
  }, [searchTerm, genderFilter, nationalityFilter, teamFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando jugadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            Error al cargar jugadores: {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          <button
            onClick={() => refetch()}
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
        {user ? (
          <div className="mb-4 bg-brand-50 border border-brand-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <p className="text-sm text-brand-800">
                <span className="font-bold">¿Buscando tu perfil?</span> Si ya has participado antes, búscate aquí abajo y dale a <strong>"Reclamar este Perfil"</strong> para que tus estadísticas se vinculen a tu nueva cuenta.
              </p>
            </div>
          </div>
        ) : (
          <JoinCTA
            className="mb-4"
            message={
              <>
                <span className="font-bold">¿Todavía no jugaste?</span> Para sumarte a una competencia, contactá a un{' '}
                <button onClick={() => navigate('/equipos')} className="font-semibold underline hover:text-brand-900">equipo</button>
                {' '}o una{' '}
                <button onClick={() => navigate('/competencias')} className="font-semibold underline hover:text-brand-900">organización</button>
                {' '}por sus redes sociales.
              </>
            }
          />
        )}

        {/* Búsqueda + filtros colapsables */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre o alias..."
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(v => !v)}
          activeFiltersCount={activeFiltersCount}
          chips={jugadoresChips}
        >
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <div>
              <label htmlFor="gender" className="block text-xs font-medium text-slate-500 mb-1">Género</label>
              <select
                id="gender"
                value={genderFilter}
                onChange={(e) => { setGenderFilter(e.target.value); }}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
              >
                <option value="">Todos</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label htmlFor="nationality" className="block text-xs font-medium text-slate-500 mb-1">Nacionalidad</label>
              <select
                id="nationality"
                value={nationalityFilter}
                onChange={(e) => { setNationalityFilter(e.target.value); }}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
              >
                <option value="">Todas</option>
                {nationalities.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="team" className="block text-xs font-medium text-slate-500 mb-1">Equipo</label>
              <select
                id="team"
                value={teamFilter}
                onChange={(e) => { setTeamFilter(e.target.value); }}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
              >
                <option value="">Todos</option>
                {equiposOrdenados.map(e => (
                  <option key={e._id || e.id} value={e._id || e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end col-span-2 sm:col-span-1">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setGenderFilter('');
                  setNationalityFilter('');
                  setTeamFilter('');
                }}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </FilterBar>

        {!jugadoresVisible || jugadoresVisible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay jugadores disponibles</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {jugadoresVisible.map((jugador) => {
                const jugadorId = jugador._id || jugador.id;
                return (
                <JugadorCard
                  key={jugadorId}
                  jugador={jugador}
                  onClick={() => navigate(`/jugadores/${jugadorId}`)}
                />
              );
              })}
            </div>

            {/* Target para el Intersection Observer */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
              {hasMore && (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"></div>
                  <p className="text-xs text-slate-400 font-medium">Cargando más jugadores...</p>
                </div>
              )}
              {!hasMore && filteredAndSortedItems.length > 0 && (
                <p className="text-sm text-slate-400 font-medium">✨ Has llegado al final del directorio</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Jugadores;

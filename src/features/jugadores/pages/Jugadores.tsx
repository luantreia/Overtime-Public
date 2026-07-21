
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { JugadorCard } from '../../../shared/components';
import { JugadorService, type Jugador } from '../services/jugadorService';
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
  const [rankedOnly, setRankedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const activeFiltersCount = (genderFilter ? 1 : 0) + (nationalityFilter ? 1 : 0) + (rankedOnly ? 1 : 0);

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
    if (rankedOnly) items = items.filter(j => j.isRanked);

    // 3. Aplicar Discovery Score (el orden dinámico que definimos antes)
    const getDiscoveryScore = (j: Jugador, seed: number) => {
      let score = 0;
      if (j.foto) score += 10;
      if (j.alias) score += 8;
      if (j.userId || j.perfilReclamado) score += 15;
      const activity = (j.partidosCount || 0) + (j.equiposCount || 0) * 2;
      score += Math.min(activity, 30);
      const playerIdStr = (j._id || j.id || '0').toString();
      const idHash = playerIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const dailyNoise = (idHash + seed) % 15;
      return score + dailyNoise;
    };

    items.sort((a, b) => getDiscoveryScore(b, discoverySeed) - getDiscoveryScore(a, discoverySeed));
    
    return items;
  }, [paged, searchTerm, genderFilter, nationalityFilter, rankedOnly, discoverySeed]);

  // Jugadores a mostrar actualmente (el "slide" del infinite scroll)
  const jugadoresVisible = useMemo(() => {
    return filteredAndSortedItems.slice(0, displayLimit);
  }, [filteredAndSortedItems, displayLimit]);

  const hasMore = displayLimit < filteredAndSortedItems.length;

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
  }, [searchTerm, genderFilter, nationalityFilter, rankedOnly]);

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
        {user && (
          <div className="mb-4 bg-brand-50 border border-brand-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <p className="text-sm text-brand-800">
                <span className="font-bold">¿Buscando tu perfil?</span> Si ya has participado antes, búscate aquí abajo y dale a <strong>"Reclamar este Perfil"</strong> para que tus estadísticas se vinculen a tu nueva cuenta.
              </p>
            </div>
          </div>
        )}

        {/* Búsqueda + filtros colapsables */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                id="search"
                type="text"
                placeholder="Buscar por nombre o alias..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); }}
                className="w-full rounded-lg border-slate-300 bg-white shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-2 pl-9 pr-3 border"
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`relative flex-shrink-0 flex items-center justify-center h-[38px] w-[38px] rounded-lg border transition-colors ${
                showFilters ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-slate-500 hover:text-slate-700'
              }`}
              aria-label="Filtros"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-2 grid gap-3 grid-cols-2 sm:grid-cols-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
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
                <label className="block text-xs font-medium text-slate-500 mb-1">Ranked</label>
                <button
                  type="button"
                  onClick={() => setRankedOnly(v => !v)}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                    rankedOnly ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${rankedOnly ? 'bg-white' : 'bg-emerald-500'}`} />
                  Rankeados
                </button>
              </div>
              <div className="flex items-end col-span-2 sm:col-span-1">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setGenderFilter('');
                    setNationalityFilter('');
                    setRankedOnly(false);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

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

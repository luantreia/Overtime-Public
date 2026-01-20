import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JugadorCard } from '../../../shared/components';
import { useEntity } from '../../../shared/hooks';
import { JugadorService, type Jugador } from '../services/jugadorService';

const Jugadores: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');

  const { data: paged, loading, error, refetch } = useEntity<Jugador[]>(
    useCallback(() => JugadorService.getAll(), [])
  );

  // Extraer nacionalidades únicas de los datos para el filtro
  const nationalities = useMemo(() => {
    if (!paged || !Array.isArray(paged)) return [];
    const unique = new Set(paged.map(j => j.nacionalidad).filter(Boolean));
    return Array.from(unique).sort();
  }, [paged]);

  const filteredItems = useMemo(() => {
    if (!paged) return [];
    let items = [...paged];

    // Aplicar búsqueda por nombre/alias
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      items = items.filter(j => 
        j.nombre.toLowerCase().includes(lowSearch) || 
        j.alias?.toLowerCase().includes(lowSearch)
      );
    }

    // Aplicar filtro de género
    if (genderFilter) {
      items = items.filter(j => j.genero === genderFilter);
    }

    // Aplicar filtro de nacionalidad
    if (nationalityFilter) {
      items = items.filter(j => j.nacionalidad === nationalityFilter);
    }

    return items;
  }, [paged, searchTerm, genderFilter, nationalityFilter]);

  const jugadores = useMemo(() => {
    const items = [...filteredItems];
    
    // Función para calcular qué tan "completo" está el perfil del jugador
    const getCompletenessScore = (j: Jugador) => {
      let score = 0;
      if (j.foto) score += 10;
      if (j.alias) score += 5;
      if (j.nacionalidad) score += 3;
      if (j.genero) score += 2;
      if (j.edad) score += 2;
      
      // Priorizar también por datos relacionales si vienen en el objeto
      if (j.equiposCount) score += j.equiposCount * 2;
      if (j.partidosCount) score += j.partidosCount * 2;
      if (Array.isArray(j.equipos)) score += j.equipos.length * 3;
      if (Array.isArray(j.partidos)) score += j.partidos.length * 2;
      
      return score;
    };

    // Ordenamos: más completos primero
    items.sort((a, b) => getCompletenessScore(b) - getCompletenessScore(a));

    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [filteredItems, page, limit]);

  const total = filteredItems.length;
  const totalPages = useMemo(() => (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1), [total, limit]);

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
          <p className="mb-4 text-red-600">Error al cargar jugadores: {error}</p>
          <button
            onClick={refetch}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Jugadores</h1>
          <p className="mt-2 text-slate-600">Directorio de jugadores registrados</p>
        </div>

        {/* Filtros */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">Buscar por nombre o alias</label>
            <input
              id="search"
              type="text"
              placeholder="Ej: Nahum..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">Género</label>
            <select
              id="gender"
              value={genderFilter}
              onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            >
              <option value="">Todos</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-slate-700 mb-1">Nacionalidad</label>
            <select
              id="nationality"
              value={nationalityFilter}
              onChange={(e) => { setNationalityFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            >
              <option value="">Todas</option>
              {nationalities.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setGenderFilter('');
                setNationalityFilter('');
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {!jugadores || jugadores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay jugadores disponibles</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jugadores.map((jugador) => {
              const jugadorId = jugador._id || jugador.id;
              return (
              <JugadorCard
                key={jugadorId}
                jugador={jugador}
                variante="activo"
                actions={
                  <button
                    onClick={() => navigate(`/jugadores/${jugadorId}`)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
                  >
                    Ver detalles
                  </button>
                }
              />
            );
            })}
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
    </div>
  );
};

export default Jugadores;

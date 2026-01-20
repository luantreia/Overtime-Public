import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JugadorCard } from '../../../shared/components';
import { useEntity } from '../../../shared/hooks';
import { JugadorService, type Jugador } from '../services/jugadorService';

const Jugadores: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: paged, loading, error, refetch } = useEntity<Jugador[]>(
    useCallback(() => JugadorService.getAll(), [])
  );
  const jugadores = useMemo(() => {
    if (!paged) return [];
    
    const items = Array.isArray(paged) ? [...paged] : [...(paged.items ?? [])];
    
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

    if (Array.isArray(paged)) {
      const start = (page - 1) * limit;
      return items.slice(start, start + limit);
    }
    return items;
  }, [paged, page, limit]);
  const total = useMemo(() => {
    if (!paged) return 0;
    if (Array.isArray(paged)) return paged.length;
    return paged.total ?? jugadores.length;
  }, [paged, jugadores.length]);
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { JugadorService } from '../services/jugadorService';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import EmptyState from '../../../shared/components/EmptyState/EmptyState';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

interface PartidosHistorialProps {
  jugadorId: string;
}

const POR_PAGINA = 20;

export const PartidosHistorial: React.FC<PartidosHistorialProps> = ({ jugadorId }) => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['jugador-history', jugadorId],
    queryFn: ({ pageParam }) =>
      JugadorService.getHistoryPage(jugadorId, { page: pageParam, limit: POR_PAGINA }),
    initialPageParam: 1,
    getNextPageParam: (ultima) => (ultima.page < ultima.pages ? ultima.page + 1 : undefined),
    enabled: !!jugadorId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  const partidos = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (partidos.length === 0) {
    return <EmptyState message="No se encontraron partidos en el historial de este jugador." icon="🏐" />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Mostrando {partidos.length} de {total} partido{total === 1 ? '' : 's'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {partidos.map((item: any) => (
          <PartidoCard
            key={item.partido.id}
            partido={item.partido}
            eloDelta={item.isRanked ? item.eloDelta : undefined}
            onClick={() => navigate(`/partidos/${item.partido.id}`)}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Cargando…' : 'Ver más partidos'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PartidosHistorial;

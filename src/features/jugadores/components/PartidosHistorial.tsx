import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { JugadorService } from '../services/jugadorService';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import EmptyState from '../../../shared/components/EmptyState/EmptyState';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

interface PartidosHistorialProps {
  jugadorId: string;
}

export const PartidosHistorial: React.FC<PartidosHistorialProps> = ({ jugadorId }) => {
  const navigate = useNavigate();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['jugador-history', jugadorId],
    queryFn: () => JugadorService.getHistory(jugadorId),
    enabled: !!jugadorId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (history.length === 0) {
    return <EmptyState message="No se encontraron partidos en el historial de este jugador." icon="🏐" />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {history.map((item: any) => (
        <PartidoCard
          key={item.partido.id}
          partido={item.partido}
          eloDelta={item.isRanked ? item.eloDelta : undefined}
          onClick={() => navigate(`/partidos/${item.partido.id}`)}
        />
      ))}
    </div>
  );
};

export default PartidosHistorial;

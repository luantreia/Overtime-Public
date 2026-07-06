import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PartidoCard from '../../../shared/components/PartidoCard';
import { EstadisticasPartidoModal } from '../../../shared/components/EstadisticasPartidoModal';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

interface EquipoEstadisticasTabProps {
  equipoId: string;
}

export const EquipoEstadisticasTab: React.FC<EquipoEstadisticasTabProps> = ({ equipoId }) => {
  const navigate = useNavigate();
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const { data: partidos = [], isLoading } = useQuery({
    queryKey: ['equipo-estadisticas', equipoId],
    queryFn: () => PartidoService.getAll({ equipo: equipoId, estado: 'finalizado' }),
    enabled: !!equipoId,
  });

  const ordenados = useMemo(
    () => [...partidos].sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime()),
    [partidos]
  );

  const handleShowStats = (partido: Partido) => {
    setSelectedPartido(partido);
    setShowStatsModal(true);
  };

  const handleCloseStats = () => {
    setShowStatsModal(false);
    setSelectedPartido(null);
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando partidos…</p>;
  }

  if (ordenados.length === 0) {
    return <EmptyState message="Este equipo todavía no tiene partidos finalizados con estadísticas cargadas." />;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ordenados.map((partido) => (
          <PartidoCard
            key={partido.id || partido._id}
            partido={partido}
            variante="resultado"
            onClick={() => navigate(`/partidos/${partido.id || partido._id}`)}
            actions={
              partido.sets && partido.sets.length > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowStats(partido);
                  }}
                  className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                >
                  📊 Ver estadísticas
                </button>
              ) : null
            }
          />
        ))}
      </div>

      {selectedPartido && (
        <EstadisticasPartidoModal
          isOpen={showStatsModal}
          onClose={handleCloseStats}
          partidoId={selectedPartido._id || selectedPartido.id || ''}
          partido={{
            _id: selectedPartido._id || selectedPartido.id || '',
            modoEstadisticas: (selectedPartido as any).modoEstadisticas,
            modoVisualizacion: (selectedPartido as any).modoVisualizacion,
          }}
        />
      )}
    </div>
  );
};

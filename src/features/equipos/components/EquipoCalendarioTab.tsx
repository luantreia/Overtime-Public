import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PartidoCard from '../../../shared/components/PartidoCard';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

interface EquipoCalendarioTabProps {
  equipoId: string;
}

const fechaHoraValue = (p: Partido): number => {
  const iso = p.fecha && p.hora ? `${p.fecha}T${p.hora}` : p.fecha;
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

export const EquipoCalendarioTab: React.FC<EquipoCalendarioTabProps> = ({ equipoId }) => {
  const navigate = useNavigate();

  const { data: partidos = [], isLoading } = useQuery({
    queryKey: ['equipo-calendario', equipoId],
    queryFn: () => PartidoService.getAll({ equipo: equipoId }),
    enabled: !!equipoId,
  });

  const proximos = useMemo(
    () =>
      partidos
        .filter((p) => p.estado === 'programado' || p.estado === 'en_juego')
        .sort((a, b) => fechaHoraValue(a) - fechaHoraValue(b)),
    [partidos]
  );

  const resultados = useMemo(
    () =>
      partidos
        .filter((p) => p.estado === 'finalizado')
        .sort((a, b) => fechaHoraValue(b) - fechaHoraValue(a)),
    [partidos]
  );

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando calendario…</p>;
  }

  if (proximos.length === 0 && resultados.length === 0) {
    return <EmptyState message="Este equipo todavía no tiene partidos programados ni jugados." />;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
          Próximos partidos
        </h2>
        {proximos.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No hay partidos programados por el momento.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {proximos.map((p) => (
              <PartidoCard
                key={p.id || p._id}
                partido={p}
                variante="proximo"
                onClick={() => navigate(`/partidos/${p.id || p._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="h-8 w-1 bg-indigo-600 rounded-full"></span>
          Resultados recientes
        </h2>
        {resultados.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Este equipo todavía no jugó partidos finalizados.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {resultados.map((p) => (
              <PartidoCard
                key={p.id || p._id}
                partido={p}
                variante="resultado"
                onClick={() => navigate(`/partidos/${p.id || p._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

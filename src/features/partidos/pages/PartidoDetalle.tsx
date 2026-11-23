import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DetallePartido from '../../../shared/components/DetallePartido';
import { BackButton } from '../../../shared/components';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const PartidoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Solo lee la caché que llena DetallePartido (misma queryKey); no dispara otro fetch.
  const { data: partido } = useQuery<any>({ queryKey: ['partido-detalle', id], enabled: false });
  const local = partido?.equipoLocal?.nombre;
  const visitante = partido?.equipoVisitante?.nombre;
  const titulo = partido?.nombre || (local && visitante ? `${local} vs ${visitante}` : 'Partido');
  const jugado = partido?.estado === 'finalizado';
  usePageTitle(titulo, partido ? {
    description: jugado
      ? `${local || 'Local'} ${partido.marcadorLocal ?? 0} - ${partido.marcadorVisitante ?? 0} ${visitante || 'Visitante'}: resultado, sets y estadísticas del partido de dodgeball.`
      : `${titulo}: partido de dodgeball. Horario, resultado en vivo y estadísticas.`,
    jsonLd: {
      '@type': 'SportsEvent',
      name: titulo,
      sport: 'Dodgeball',
      startDate: partido.fecha,
      homeTeam: local ? { '@type': 'SportsTeam', name: local } : undefined,
      awayTeam: visitante ? { '@type': 'SportsTeam', name: visitante } : undefined,
    },
  } : {});

  if (!id) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">ID de partido no proporcionado</p>
          <BackButton fallback="/partidos" label="Volver a la lista" className="justify-center" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BackButton fallback="/partidos" className="mb-6" />

        <DetallePartido partidoId={id} />
      </div>
    </div>
  );
};

export default PartidoDetalle;

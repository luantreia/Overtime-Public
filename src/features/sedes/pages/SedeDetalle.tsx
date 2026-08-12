import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { BackButton, PartidoCard } from '../../../shared/components';
import SedeMap from '../../../shared/components/SedeMap/SedeMap';
import { SedeService } from '../services/sedeService';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

const fechaHoraValue = (p: Partido): number => {
  const iso = p.fecha && p.hora ? `${p.fecha}T${p.hora}` : p.fecha;
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

const SedeDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: sede, isLoading, error } = useQuery({
    queryKey: ['sede', id],
    queryFn: () => SedeService.getById(id!),
    enabled: !!id,
  });
  usePageTitle(sede?.nombre);

  const { data: partidos = [], isLoading: loadingPartidos } = useQuery({
    queryKey: ['partidos-sede', id],
    queryFn: () => PartidoService.getAll({ sede: id }),
    enabled: !!id,
  });

  const proximosPartidos = (partidos as Partido[])
    .filter(p => p.estado === 'programado' || p.estado === 'en_juego')
    .sort((a, b) => fechaHoraValue(a) - fechaHoraValue(b))
    .slice(0, 10);

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">ID de sede no proporcionado</p>
          <BackButton fallback="/" label="Volver" className="justify-center" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando sede...</p>
        </div>
      </div>
    );
  }

  if (error || !sede) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">No se pudo cargar la sede.</p>
          <BackButton fallback="/" label="Volver" className="justify-center" />
        </div>
      </div>
    );
  }

  const organizacion = typeof sede.organizacion === 'object' ? sede.organizacion : undefined;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BackButton fallback="/" className="mb-6" />

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-slate-900">{sede.nombre}</h1>
          {sede.direccion && <p className="mt-1 text-slate-600">{sede.direccion}</p>}

          {organizacion && (
            <p className="mt-2 text-sm text-slate-500">
              Sede de{' '}
              <Link to={`/organizaciones/${organizacion._id}`} className="text-brand-600 hover:underline">
                {organizacion.nombre}
              </Link>
            </p>
          )}

          {sede.canchas && sede.canchas.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Canchas</p>
              <div className="flex flex-wrap gap-2">
                {sede.canchas.map((cancha) => (
                  <span key={cancha} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {cancha}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sede.coordenadas?.lat != null && sede.coordenadas?.lng != null && (
            <div className="mt-4">
              <SedeMap lat={sede.coordenadas.lat} lng={sede.coordenadas.lng} nombre={sede.nombre} />
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Próximos partidos</h2>
          {loadingPartidos ? (
            <p className="text-slate-500">Cargando partidos...</p>
          ) : proximosPartidos.length === 0 ? (
            <p className="text-slate-500">No hay partidos programados en esta sede por ahora.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {proximosPartidos.map((partido) => (
                <PartidoCard
                  key={partido.id}
                  partido={partido}
                  onClick={() => navigate(`/partidos/${partido.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SedeDetalle;

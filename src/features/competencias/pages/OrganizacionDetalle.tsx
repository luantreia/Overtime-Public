import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { CompetenciaCard } from '../../../shared/components';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import { CompetenciaService, type Competencia } from '../services/competenciaService';
import { OrganizacionService } from '../services/organizacionService';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';
import { mapEstadoVariante, type CompetenciaEstadoVariante } from '../../../shared/utils/competenciaEstado';

const GRUPOS: { estado: CompetenciaEstadoVariante; titulo: string }[] = [
  { estado: 'en_curso', titulo: 'En curso' },
  { estado: 'proximamente', titulo: 'Próximas' },
  { estado: 'finalizada', titulo: 'Finalizadas' },
];

const fechaHoraValue = (p: Partido): number => {
  const iso = p.fecha && p.hora ? `${p.fecha}T${p.hora}` : p.fecha;
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

const OrganizacionDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: organizacion, isLoading: loadingOrg, error: errorOrg } = useQuery({
    queryKey: ['organizacion', id],
    queryFn: () => OrganizacionService.getById(id!),
    enabled: !!id,
  });
  usePageTitle(organizacion?.nombre);

  const { data: competencias = [], isLoading: loadingComps } = useQuery({
    queryKey: ['competencias'],
    queryFn: () => CompetenciaService.getAll(),
    enabled: !!id,
  });

  const competenciasOrg = useMemo(
    () => (competencias as Competencia[]).filter(c => (c.organizacion?._id || c.organizacion?.id) === id),
    [competencias, id]
  );

  const gruposCompetencias = useMemo(() => {
    return GRUPOS.map(({ estado, titulo }) => ({
      titulo,
      competencias: competenciasOrg.filter(c => mapEstadoVariante(c.estado) === estado),
    }));
  }, [competenciasOrg]);

  // Solo pedimos partidos de competencias activas o próximas: acotamos la cantidad de
  // requests en paralelo y evitamos traer historial de competencias finalizadas hace tiempo.
  const competenciasActivas = useMemo(
    () => competenciasOrg.filter(c => mapEstadoVariante(c.estado) !== 'finalizada'),
    [competenciasOrg]
  );

  const partidosQueries = useQueries({
    queries: competenciasActivas.map((c) => ({
      queryKey: ['partidos-competencia', c.id],
      queryFn: () => PartidoService.getByCompetenciaId(c.id),
      enabled: !!id,
    })),
  });

  const loadingPartidos = partidosQueries.some(q => q.isLoading);
  const todosPartidos = useMemo(
    () => partidosQueries.flatMap(q => (q.data as Partido[] | undefined) ?? []),
    [partidosQueries]
  );

  const resultadosRecientes = useMemo(
    () =>
      todosPartidos
        .filter(p => p.estado === 'finalizado')
        .sort((a, b) => fechaHoraValue(b) - fechaHoraValue(a))
        .slice(0, 5),
    [todosPartidos]
  );

  const proximosPartidos = useMemo(
    () =>
      todosPartidos
        .filter(p => p.estado === 'programado' || p.estado === 'en_juego')
        .sort((a, b) => fechaHoraValue(a) - fechaHoraValue(b))
        .slice(0, 5),
    [todosPartidos]
  );

  if (loadingOrg || loadingComps) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando organización...</p>
        </div>
      </div>
    );
  }

  if (errorOrg || !organizacion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">No se pudo cargar la organización.</p>
          <button
            onClick={() => navigate('/competencias?vista=organizaciones')}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Volver a organizaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/competencias?vista=organizaciones')}
          className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Volver a organizaciones
        </button>

        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          {organizacion.logoUrl && (
            <img
              src={organizacion.logoUrl}
              alt={`Logo de ${organizacion.nombre}`}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{organizacion.nombre}</h1>
            {organizacion.descripcion && (
              <p className="mt-1 text-slate-600">{organizacion.descripcion}</p>
            )}
          </div>
        </div>

        {/* Novedades */}
        {!loadingPartidos && (resultadosRecientes.length > 0 || proximosPartidos.length > 0) && (
          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            {proximosPartidos.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Próximos partidos</h2>
                <div className="grid gap-4">
                  {proximosPartidos.map((partido) => (
                    <PartidoCard
                      key={partido.id}
                      partido={partido}
                      onClick={() => navigate(`/partidos/${partido.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
            {resultadosRecientes.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Resultados recientes</h2>
                <div className="grid gap-4">
                  {resultadosRecientes.map((partido) => (
                    <PartidoCard
                      key={partido.id}
                      partido={partido}
                      onClick={() => navigate(`/partidos/${partido.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Competencias agrupadas por estado */}
        {competenciasOrg.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Esta organización todavía no tiene competencias.</p>
          </div>
        ) : (
          gruposCompetencias
            .filter(g => g.competencias.length > 0)
            .map(({ titulo, competencias: comps }) => (
              <div key={titulo} className="mb-10">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">{titulo}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {comps.map((competencia) => (
                    <CompetenciaCard
                      key={competencia.id}
                      competencia={competencia}
                      variante={mapEstadoVariante(competencia.estado)}
                      onClick={() => navigate(`/competencias/${competencia.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default OrganizacionDetalle;

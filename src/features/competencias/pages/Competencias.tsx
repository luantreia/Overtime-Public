import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { CompetenciaCard } from '../../../shared/components';
import { OrganizacionCard } from '../../../shared/components';
import { CompetenciaService, type Competencia } from '../services/competenciaService';
import { OrganizacionService } from '../services/organizacionService';
import { mapEstadoVariante, type CompetenciaEstadoVariante } from '../../../shared/utils/competenciaEstado';

type Vista = 'todas' | 'organizaciones';

const ESTADO_FILTROS: { value: CompetenciaEstadoVariante | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'proximamente', label: 'Próximas' },
  { value: 'finalizada', label: 'Finalizadas' },
];

const Competencias: React.FC = () => {
  usePageTitle('Competencias');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<CompetenciaEstadoVariante | ''>('');

  const vista: Vista = searchParams.get('vista') === 'organizaciones' ? 'organizaciones' : 'todas';
  const setVista = (next: Vista) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (next === 'todas') params.delete('vista');
      else params.set('vista', next);
      return params;
    }, { replace: true });
  };

  const { data: organizaciones = [], isLoading: loadingOrgs, error: errorOrgs, refetch: refetchOrgs } = useQuery({
    queryKey: ['organizaciones'],
    queryFn: () => OrganizacionService.getAll(),
    enabled: vista === 'organizaciones',
  });

  const { data: competencias = [], isLoading: loadingComps, error: errorComps, refetch: refetchComps } = useQuery({
    queryKey: ['competencias'],
    queryFn: () => CompetenciaService.getAll(),
    enabled: vista === 'todas',
  });

  const competenciasFiltradas = useMemo(() => {
    return (competencias as Competencia[]).filter((c) => {
      if (estadoFiltro && mapEstadoVariante(c.estado) !== estadoFiltro) return false;
      if (busqueda.trim() && !c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())) return false;
      return true;
    });
  }, [competencias, estadoFiltro, busqueda]);

  const loading = vista === 'todas' ? loadingComps : loadingOrgs;
  const error = vista === 'todas' ? errorComps : errorOrgs;
  const refetch = vista === 'todas' ? refetchComps : refetchOrgs;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">
            {vista === 'todas' ? 'Cargando competencias...' : 'Cargando organizaciones...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            Error al cargar {vista === 'todas' ? 'competencias' : 'organizaciones'}: {errorMsg}
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Competencias</h1>
          <p className="mt-2 text-slate-600">
            {vista === 'todas' ? 'Explorá todas las competencias disponibles' : 'Selecciona una organización para conocerla en detalle'}
          </p>
        </div>

        {/* Toggle de vista */}
        <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setVista('todas')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              vista === 'todas' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas las competencias
          </button>
          <button
            onClick={() => setVista('organizaciones')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              vista === 'organizaciones' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Por organización
          </button>
        </div>

        {vista === 'todas' && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar competencia..."
              className="w-full max-w-xs rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            />
            <div className="flex flex-wrap gap-2">
              {ESTADO_FILTROS.map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => setEstadoFiltro(value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    estadoFiltro === value
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {vista === 'todas' ? (
          competenciasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No hay competencias que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {competenciasFiltradas.map((competencia) => (
                <CompetenciaCard
                  key={competencia.id}
                  competencia={competencia}
                  variante={mapEstadoVariante(competencia.estado)}
                  onClick={() => navigate(`/competencias/${competencia.id}`)}
                  actions={
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/competencias/${competencia.id}`);
                      }}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
                    >
                      Ver detalles
                    </button>
                  }
                />
              ))}
            </div>
          )
        ) : organizaciones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay organizaciones disponibles</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {organizaciones.map((organizacion) => (
              <OrganizacionCard
                key={organizacion.id}
                organizacion={organizacion}
                onClick={() => navigate(`/organizaciones/${organizacion.id}`)}
                actions={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/organizaciones/${organizacion.id}`);
                    }}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
                  >
                    Ver perfil
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Competencias;

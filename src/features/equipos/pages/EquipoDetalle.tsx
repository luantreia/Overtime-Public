import React, { useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EquipoService, type Equipo } from '../services/equipoService';
import { PartidoService } from '../../partidos/services/partidoService';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { useEquipoCategoriasActivas } from '../hooks/useEquipoCategoriasActivas';
import {
  EquipoHeader,
  EquipoResumenTab,
  EquipoCalendarioTab,
  EquipoPlantelTab,
  EquipoPalmaresTab,
  EquipoEstadisticasTab,
} from '../components';

type TabKey = 'resumen' | 'calendario' | 'plantel' | 'palmares' | 'estadisticas';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'resumen', label: 'Resumen', icon: '📊' },
  { key: 'calendario', label: 'Calendario', icon: '📅' },
  { key: 'plantel', label: 'Plantel', icon: '👥' },
  { key: 'palmares', label: 'Palmarés', icon: '🏆' },
  { key: 'estadisticas', label: 'Estadísticas', icon: '📈' },
];

const EquipoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get('tab') as TabKey) || 'resumen';

  const updateParams = useCallback((params: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const { data: equipo, isLoading: loading, error: equipoQueryError } = useQuery<Equipo>({
    queryKey: ['equipo', id],
    queryFn: () => {
      if (!id) throw new Error('ID de equipo no proporcionado');
      return EquipoService.getById(id);
    },
    enabled: !!id,
  });
  const error = equipoQueryError instanceof Error ? equipoQueryError.message : equipoQueryError ? String(equipoQueryError) : null;

  usePageTitle(equipo?.nombre);

  const equipoId = equipo?._id || equipo?.id || id || '';

  const { data: categorias = [], isLoading: loadingCategorias } = useEquipoCategoriasActivas(
    equipoId,
    equipo?.participaciontemporadas
  );

  const { data: proximosPartidos = [] } = useQuery({
    queryKey: ['equipo-proximo-partido', equipoId],
    queryFn: () => PartidoService.getAll({ equipo: equipoId, estado: 'programado' }),
    enabled: !!equipoId,
  });

  const proximoPartido = useMemo(() => {
    if (proximosPartidos.length === 0) return null;
    return [...proximosPartidos].sort((a, b) => {
      const fa = a.fecha && a.hora ? `${a.fecha}T${a.hora}` : a.fecha || '';
      const fb = b.fecha && b.hora ? `${b.fecha}T${b.hora}` : b.fecha || '';
      return new Date(fa).getTime() - new Date(fb).getTime();
    })[0];
  }, [proximosPartidos]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando detalles del equipo...</p>
        </div>
      </div>
    );
  }

  if (error || !equipo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar equipo: {error || 'No encontrado'}</p>
          <button onClick={() => navigate('/equipos')} className="text-brand-600 hover:underline">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <EquipoHeader
          equipo={equipo}
          proximoPartido={proximoPartido}
          categorias={categorias}
          onBack={() => navigate('/equipos')}
        />

        <div className="relative mt-6 mb-6 border-b border-slate-200">
          <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => updateParams({ tab: tab.key })}
                className={`${
                  activeTab === tab.key
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } flex-shrink-0 whitespace-nowrap border-b-2 py-3 sm:py-4 px-1 text-xs sm:text-sm font-medium flex items-center gap-1.5`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-slate-50 to-transparent sm:hidden" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[400px]">
          {activeTab === 'resumen' && (
            <EquipoResumenTab equipo={equipo} equipoId={equipoId} categorias={categorias} loadingCategorias={loadingCategorias} />
          )}
          {activeTab === 'calendario' && <EquipoCalendarioTab equipoId={equipoId} />}
          {activeTab === 'plantel' && <EquipoPlantelTab equipo={equipo} />}
          {activeTab === 'palmares' && <EquipoPalmaresTab equipo={equipo} equipoId={equipoId} />}
          {activeTab === 'estadisticas' && <EquipoEstadisticasTab equipoId={equipoId} />}
        </div>
      </div>
    </div>
  );
};

export default EquipoDetalle;

import React, { useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EquipoService, type Equipo } from '../services/equipoService';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import {
  EquipoHeader,
  EquipoResumenTab,
  EquipoCalendarioTab,
  EquipoPlantelTab,
  EquipoEstadisticasTab,
} from '../components';

type TabKey = 'resumen' | 'calendario' | 'plantel' | 'estadisticas';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'calendario', label: 'Calendario' },
  { key: 'plantel', label: 'Plantel' },
  { key: 'estadisticas', label: 'Estadísticas' },
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
        <EquipoHeader equipo={equipo} />

        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/50 rounded-2xl w-full border border-slate-100 mt-6 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => updateParams({ tab: tab.key })}
              className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest transition-all text-center ${
                activeTab === tab.key ? 'bg-white text-brand-700 shadow-sm shadow-brand-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[400px]">
          {activeTab === 'resumen' && <EquipoResumenTab equipo={equipo} equipoId={equipoId} />}
          {activeTab === 'calendario' && <EquipoCalendarioTab equipoId={equipoId} />}
          {activeTab === 'plantel' && <EquipoPlantelTab equipo={equipo} />}
          {activeTab === 'estadisticas' && <EquipoEstadisticasTab equipoId={equipoId} />}
        </div>
      </div>
    </div>
  );
};

export default EquipoDetalle;

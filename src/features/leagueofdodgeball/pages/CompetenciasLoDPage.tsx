import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { CompetenciaCard } from '../../../shared/components';
import { CompetenciaService, type Competencia } from '../../competencias/services/competenciaService';

const mapEstadoVariante = (estado: any): 'proximamente' | 'en_curso' | 'finalizada' => {
  if (!estado) return 'proximamente';
  const s = String(estado).toLowerCase().trim();
  if (s.includes('en_curso') || s.includes('en curso') || s.includes('activa')) return 'en_curso';
  if (s.includes('finalizada') || s.includes('finalizado') || s.includes('terminada')) return 'finalizada';
  return 'proximamente';
};

export default function CompetenciasLoDPage() {
  usePageTitle('Competencias LoD');
  const navigate = useNavigate();

  const { data: competencias = [], isLoading, error } = useQuery<Competencia[]>({
    queryKey: ['competencias-lod'],
    queryFn: async () => {
      const all = await CompetenciaService.getAll();
      return all.filter((c: any) => c.rankedEnabled === true);
    },
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto" />
          <p className="text-slate-600">Cargando competencias rankeadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Competencias LoD</h1>
        <p className="text-sm text-slate-500 mt-0.5">Competencias con ranking verificado de League of Dodgeball</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar las competencias
        </div>
      )}

      {!isLoading && competencias.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <TrophyIcon className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-base font-semibold text-slate-700">Sin competencias rankeadas activas</p>
            <p className="mt-1 text-sm text-slate-400">Todavía no hay competencias con ranking LoD habilitado.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {competencias.map((competencia) => (
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
      )}
    </div>
  );
}

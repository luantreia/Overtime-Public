import React, { useCallback } from 'react';
import { CompetenciaCard } from '../../../shared/components';
import { useEntity } from '../../../shared/hooks';
import { CompetenciaService, type Competencia } from '../services/competenciaService';

// Mapear estados del backend a variantes conocidas
const mapEstadoVariante = (estado: any): 'proximamente' | 'en_curso' | 'finalizada' => {
  if (!estado) return 'proximamente';
  
  const estadoStr = String(estado).toLowerCase().trim();
  
  if (estadoStr.includes('en_curso') || estadoStr.includes('en curso') || estadoStr.includes('activa') || estadoStr.includes('en') && estadoStr.includes('curso')) {
    return 'en_curso';
  }
  if (estadoStr.includes('finalizada') || estadoStr.includes('finalizado') || estadoStr.includes('terminada') || estadoStr.includes('completada')) {
    return 'finalizada';
  }
  
  return 'proximamente';
};

const Competencias: React.FC = () => {
  const { data: competencias, loading, error, refetch } = useEntity<Competencia[]>(
    useCallback(() => CompetenciaService.getAll(), [])
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando competencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar competencias: {error}</p>
          <button
            onClick={refetch}
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
          <p className="mt-2 text-slate-600">Directorio de competencias registradas</p>
        </div>

        {!competencias || competencias.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay competencias disponibles</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {competencias.map((competencia) => (
              <CompetenciaCard
                key={competencia.id}
                competencia={competencia}
                variante={mapEstadoVariante(competencia.estado)}
                actions={
                  <button
                    onClick={() => console.log('Ver detalles de', competencia.nombre)}
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
    </div>
  );
};

export default Competencias;

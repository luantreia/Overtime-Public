import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompetenciaCard } from '../../../shared/components';
import { OrganizacionCard } from '../../../shared/components';
import { useEntity } from '../../../shared/hooks';
import { CompetenciaService, type Competencia } from '../services/competenciaService';
import { OrganizacionService, type Organizacion } from '../services/organizacionService';

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
  const navigate = useNavigate();
  const [selectedOrganizacion, setSelectedOrganizacion] = useState<Organizacion | null>(null);

  const { data: entidades, loading, error, refetch } = useEntity<Organizacion[] | Competencia[]>(
    useCallback(() => {
      if (selectedOrganizacion) {
        return CompetenciaService.getAll({ organizacionId: selectedOrganizacion.id });
      } else {
        return OrganizacionService.getAll();
      }
    }, [selectedOrganizacion])
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">
            {selectedOrganizacion ? 'Cargando competencias...' : 'Cargando organizaciones...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            Error al cargar {selectedOrganizacion ? 'competencias' : 'organizaciones'}: {error}
          </p>
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
          {selectedOrganizacion && (
            <button
              onClick={() => setSelectedOrganizacion(null)}
              className="mb-4 rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
            >
              ← Volver a organizaciones
            </button>
          )}
          <h1 className="text-3xl font-bold text-slate-900">
            {selectedOrganizacion ? `Competencias de ${selectedOrganizacion.nombre}` : 'Organizaciones'}
          </h1>
          <p className="mt-2 text-slate-600">
            {selectedOrganizacion ? 'Directorio de competencias de la organización' : 'Selecciona una organización para ver sus competencias'}
          </p>
        </div>

        {!entidades || entidades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {selectedOrganizacion ? 'No hay competencias disponibles para esta organización' : 'No hay organizaciones disponibles'}
            </p>
          </div>
        ) : selectedOrganizacion ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(entidades as Competencia[]).map((competencia) => (
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
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(entidades as Organizacion[]).map((organizacion) => (
              <OrganizacionCard
                key={organizacion.id}
                organizacion={organizacion}
                onClick={() => setSelectedOrganizacion(organizacion)}
                actions={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrganizacion(organizacion);
                    }}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
                  >
                    Ver competencias
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

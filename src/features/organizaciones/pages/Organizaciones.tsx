import React from 'react';
import { EntityGrid } from '../../../shared/components';
import { useEntity } from '../../../shared/hooks';
import { OrganizacionService, Organizacion } from '../services/organizacionService';

const Organizaciones: React.FC = () => {
  const { data: organizaciones, loading, error, refetch } = useEntity<Organizacion[]>(OrganizacionService.getAll.bind(OrganizacionService));

  const loadingState = loading ? 'loading' : error ? 'error' : 'success';

  const entityCards = (organizaciones ?? []).map((org) => {
    const metadata: Record<string, string | number> = {
      'Estado': org.activa ? 'Activa' : 'Inactiva',
    };

    if (org.ciudad) {
      metadata['Ciudad'] = org.ciudad;
    }

    if (org.pais) {
      metadata['País'] = org.pais;
    }

    return {
      type: 'organizacion' as const,
      id: org.id,
      title: org.nombre,
      subtitle: org.descripcion || 'Organización deportiva',
      metadata,
      actions: [
        {
          label: 'Ver detalles',
          onClick: () => console.log('Ver detalles de', org.nombre),
          variant: 'primary' as const,
        },
      ],
    };
  });

  return (
    <EntityGrid
      entities={entityCards}
      loading={loadingState}
      error={error}
      title="Organizaciones"
      subtitle="Directorio de organizaciones registradas"
      emptyMessage="No hay organizaciones disponibles"
      loadingMessage="Cargando organizaciones..."
      onRetry={refetch}
    />
  );
};

export default Organizaciones;

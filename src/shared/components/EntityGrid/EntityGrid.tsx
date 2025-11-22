import React from 'react';
import { EntityCard, type EntityCardProps, type EntityType } from '../EntityCard/EntityCard';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { EmptyState } from '../EmptyState/EmptyState';
import { LOADING_STATES } from '../../../utils/constants';

export interface EntityGridProps {
  entities: Array<Omit<EntityCardProps, 'type'> & { type: EntityType }>;
  loading: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  emptyMessage?: string;
  loadingMessage?: string;
  title?: string;
  subtitle?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  onRetry?: () => void;
}

const EntityGrid: React.FC<EntityGridProps> = ({
  entities,
  loading,
  error,
  emptyMessage = 'No hay elementos disponibles',
  loadingMessage = 'Cargando...',
  title,
  subtitle,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  onRetry,
}) => {
  const gridClasses = `grid grid-cols-${columns.sm} gap-4 md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;

  if (loading === LOADING_STATES.LOADING) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (entities.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <section>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h1 className="mb-2 text-2xl font-bold text-slate-900">{title}</h1>}
          {subtitle && <p className="text-slate-600">{subtitle}</p>}
        </div>
      )}

      <div className={gridClasses}>
        {entities.map((entity) => (
          <EntityCard key={entity.id} {...entity} />
        ))}
      </div>
    </section>
  );
};

export default EntityGrid;

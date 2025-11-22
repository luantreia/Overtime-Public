import React from 'react';

export type EntityType = 'jugador' | 'equipo' | 'organizacion' | 'competencia' | 'partido';

export interface EntityCardProps {
  type: EntityType;
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  metadata?: Record<string, string | number>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  onClick?: () => void;
  className?: string;
}

const getTypeColor = (type: EntityType): string => {
  const colors: Record<EntityType, string> = {
    jugador: 'from-blue-500 to-blue-600',
    equipo: 'from-purple-500 to-purple-600',
    organizacion: 'from-green-500 to-green-600',
    competencia: 'from-orange-500 to-orange-600',
    partido: 'from-red-500 to-red-600',
  };
  return colors[type];
};

const getTypeIcon = (type: EntityType): string => {
  const icons: Record<EntityType, string> = {
    jugador: '👤',
    equipo: '👥',
    organizacion: '🏢',
    competencia: '🏆',
    partido: '⚽',
  };
  return icons[type];
};

export const EntityCard: React.FC<EntityCardProps> = ({
  type,
  id,
  title,
  subtitle,
  description,
  image,
  metadata,
  actions,
  onClick,
  className = '',
}) => {
  const colorGradient = getTypeColor(type);
  const icon = getTypeIcon(type);

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md ${className}`}
      onClick={onClick}
      role="article"
    >
      {/* Header with image or gradient */}
      <div
        className={`relative h-32 bg-gradient-to-br ${colorGradient} p-4 text-white`}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl">{icon}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title and Subtitle */}
        <div className="mb-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
            {title}
          </h3>
          {subtitle && (
            <p className="line-clamp-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="mb-3 line-clamp-2 text-xs text-slate-600">
            {description}
          </p>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mb-3 space-y-1">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-slate-500">{key}:</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Type badge */}
        <div className="mb-3 mt-auto">
          <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 capitalize">
            {type}
          </span>
        </div>
      </div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="border-t border-slate-200 p-3">
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                  action.variant === 'danger'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : action.variant === 'secondary'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityCard;
